from fastapi import FastAPI, File, UploadFile, HTTPException
import os
import shutil
import tempfile

app = FastAPI()

@app.post("/upload-image/")
async def process_image(file: UploadFile = File(...)):
    # Validate that the uploaded file is an image
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400, detail="Uploaded file is not an image"
        )

    temp_file_path = None
    try:
        # Create a temporary file with the same file extension as the uploaded file
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(
            delete=False, suffix=suffix
        ) as tmp:
            shutil.copyfileobj(file.file, tmp)
            temp_file_path = tmp.name

        # At this point, the file is saved to disk at temp_file_path.
        # Perform your processing here. For example, you might open the image with a
        # library like Pillow, run analysis, etc.
        #
        # For demonstration, we'll just get the file size.
        file_size = os.path.getsize(temp_file_path)

        # Your processing results can then be returned or used in further logic.
        result = {
            "message": "Image processed successfully",
            "file_size": file_size,
        }

    finally:
        # Delete the temporary file if it exists.
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)

    return result
