import sqlite3
import json
from datetime import datetime


class DatabaseManager:
    def __init__(self, db_file="database.db"):
        """Initialize the manager and run migrations to create the required tables."""
        self.db_file = db_file
        # Create a connection and enable row_factory to return dict-like rows.
        self.conn = sqlite3.connect(self.db_file, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        # Enable foreign keys support.
        self.conn.execute("PRAGMA foreign_keys = ON")
        self._run_migrations()

    def _run_migrations(self):
        """Create tables if they do not exist."""
        cursor = self.conn.cursor()
        # Create the Users table.
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS Users (
                email TEXT PRIMARY KEY,
                height REAL,
                weight REAL,
                age INTEGER,
                physical_activity TEXT,
                gender TEXT,
                comorbidities TEXT,  -- JSON formatted string
                preferences TEXT
            );
            """
        )
        # Create the History table.
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS History (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT,
                upc TEXT,
                score INTEGER,
                reasoning TEXT,
                image_url TEXT,
                date TEXT,
                product_name TEXT,
                FOREIGN KEY (email) REFERENCES Users(email)
            );
            """
        )
        
        # Check if product_name column already exists in History table
        cursor.execute("PRAGMA table_info(History)")
        columns = [column[1] for column in cursor.fetchall()]
        
        # Add product_name column if it doesn't exist
        if "product_name" not in columns:
            try:
                cursor.execute(
                    """
                    ALTER TABLE History
                    ADD COLUMN product_name TEXT;
                    """
                )
                print("Added product_name column to History table")
            except Exception as e:
                print(f"Error adding product_name column: {e}")
                # Continue even if the column already exists or there's another issue
        
        self.conn.commit()

    def add_user(
        self,
        email: str,
        height: float,
        weight: float,
        age: int,
        physical_activity: str,
        gender: str,
        comorbidities: list,
        preferences: str,
    ):
        """
        Add a new user to the Users table.

        Args:
            email: User's email address (primary key).
            height: User's height.
            weight: User's weight.
            age: User's age.
            physical_activity: Description of physical activity level.
            gender: User's gender.
            comorbidities: List of comorbidities/diseases.
            preferences: User's preferences.
        """
        cursor = self.conn.cursor()
        comorbidities_json = json.dumps(comorbidities)
        try:
            cursor.execute(
                """
                INSERT INTO Users (
                    email, height, weight, age, physical_activity,
                    gender, comorbidities, preferences
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
                """,
                (
                    email,
                    height,
                    weight,
                    age,
                    physical_activity,
                    gender,
                    comorbidities_json,
                    preferences,
                ),
            )
            self.conn.commit()
        except sqlite3.IntegrityError as e:
            print("Error: A user with that email might already exist.")
            raise e

    def get_user(self, email: str):
        """
        Retrieve a user's details from the Users table.

        Args:
            email: The user's email address.

        Returns:
            A dictionary with the user's information or None if not found.
        """
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM Users WHERE email = ?;", (email,))
        row = cursor.fetchone()
        if row:
            user = dict(row)
            # Convert the JSON formatted comorbidities back to a list.
            user["comorbidities"] = json.loads(user["comorbidities"])
            return user
        return None

    def get_users(self):
        """
        Retrieve all users from the Users table.

        Returns:
            A list of dictionaries, each containing user details.
        """
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM Users;")
        rows = cursor.fetchall()
        all_users = []
        for row in rows:
            user = dict(row)
            # Convert the JSON formatted comorbidities back into a list.
            user["comorbidities"] = json.loads(user["comorbidities"])
            all_users.append(user)
        return all_users

    def add_history(
        self,
        email: str,
        upc: str,
        score: int,
        reasoning: str,
        image_url: str,
        date: str = None,
        product_name: str = None,
    ):
        """
        Add a new history entry to the History table.

        Args:
            email: User's email address to associate with this history.
            upc: A UPC code or identifier.
            score: Score associated with this history entry.
            reasoning: Explanation or reasoning behind the score.
            image_url: URL of the related image.
            date: (Optional) The date of the entry in ISO format.
                  If not provided, the current datetime is used.
            product_name: (Optional) Name of the product.
        """
        if date is None:
            date = datetime.now().isoformat()
        cursor = self.conn.cursor()
        try:
            cursor.execute(
                """
                INSERT INTO History (email, upc, score, reasoning, image_url, date, product_name)
                VALUES (?, ?, ?, ?, ?, ?, ?);
                """,
                (email, upc, score, reasoning, image_url, date, product_name),
            )
            self.conn.commit()
        except Exception as e:
            print(f"Error adding history: {e}")
            raise e

    def get_user_history(self, email: str):
        """
        Retrieve all history entries for a specific user.

        Args:
            email: The user's email address.

        Returns:
            A list of dictionaries containing history entries.
        """
        cursor = self.conn.cursor()
        cursor.execute(
            """
            SELECT * FROM History
            WHERE email = ?
            ORDER BY date DESC;
            """,
            (email,),
        )
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

    def get_all_history(self):
        """
        Retrieve all history entries from all users.

        Returns:
            A list of dictionaries containing all history entries.
        """
        cursor = self.conn.cursor()
        cursor.execute(
            """
            SELECT * FROM History
            ORDER BY date DESC;
            """
        )
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

    def clear_database(self):
        """
        Clear all data from the database. This deletes all rows from both
        Users and History tables.

        Note: This is for debugging purposes only.
        """
        cursor = self.conn.cursor()
        # Clear History first due to foreign key dependency on Users.
        cursor.execute("DELETE FROM History;")
        cursor.execute("DELETE FROM Users;")
        self.conn.commit()
        print("Database cleared of all data.")

    def view_database(self):
        """
        Print all data from the database for debugging purposes.
        """
        cursor = self.conn.cursor()
        print("------ USERS TABLE ------")
        cursor.execute("SELECT * FROM Users;")
        users = cursor.fetchall()
        for user in users:
            # Convert the JSON field so it's easier to inspect.
            user_dict = dict(user)
            user_dict["comorbidities"] = json.loads(user_dict["comorbidities"])
            print(user_dict)
        print("\n------ HISTORY TABLE ------")
        cursor.execute("SELECT * FROM History;")
        history = cursor.fetchall()
        for entry in history:
            print(dict(entry))
        print("\n")

    def close(self):
        """Close the database connection."""
        self.conn.close()

    def update_user(
        self,
        email: str,
        height: float,
        weight: float,
        age: int,
        physical_activity: str,
        gender: str,
        comorbidities: list,
        preferences: str,
    ):
        """
        Update an existing user in the Users table.

        Args:
            email: User's email address (primary key, used for identification).
            height: User's height.
            weight: User's weight.
            age: User's age.
            physical_activity: Description of physical activity level.
            gender: User's gender.
            comorbidities: List of comorbidities/diseases.
            preferences: User's preferences.
        """
        cursor = self.conn.cursor()
        comorbidities_json = json.dumps(comorbidities)
        try:
            cursor.execute(
                """
                UPDATE Users
                SET height = ?, weight = ?, age = ?, physical_activity = ?,
                    gender = ?, comorbidities = ?, preferences = ?
                WHERE email = ?;
                """,
                (
                    height,
                    weight,
                    age,
                    physical_activity,
                    gender,
                    comorbidities_json,
                    preferences,
                    email,
                ),
            )
            self.conn.commit()
            if cursor.rowcount == 0:
                print(f"Warning: No user with email {email} found to update")
                return False
            return True
        except sqlite3.Error as e:
            print(f"Error updating user: {str(e)}")
            raise e


# Example usage:
if __name__ == "__main__":
    db_manager = DatabaseManager("example.db")

    # Debug: View current database contents.
    print("Database content before adding data:")
    db_manager.view_database()

    # Adding a user.
    try:
        db_manager.add_user(
            email="user@example.com",
            height=170.5,
            weight=65.0,
            age=30,
            physical_activity="Moderate",
            gender="Female",
            comorbidities=["hypertension", "diabetes"],
            preferences="No sugar, Low salt",
        )
    except sqlite3.IntegrityError:
        print("User already exists; proceeding to fetch details.")

    # Retrieve and print a specific user.
    user = db_manager.get_user("user@example.com")
    print("Retrieved single user:")
    print(user)

    # Retrieve and print all users.
    all_users = db_manager.get_users()
    print("Retrieved all users:")
    print(all_users)

    # View the database after additions.
    print("Database content after adding data:")
    db_manager.view_database()

    # Debug: Clear the database.
    db_manager.clear_database()

    # View database after clearing.
    print("Database content after clearing data:")
    db_manager.view_database()

    # Close the database connection.
    db_manager.close()
