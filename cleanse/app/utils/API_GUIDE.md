# API Utility Guide

This guide explains how to use the centralized API utility for making requests to the backend server from any part of the application.

## Overview

The `api.ts` utility provides:

1. A consistent way to handle different environments (web, iOS, Android)
2. Automatic detection of the correct server URL
3. Consistent error handling
4. Helper methods for common HTTP operations

## Setup

No additional setup is required. The API utility automatically detects the appropriate URL based on:
- Platform (web/iOS/Android)
- Environment (development/production)
- Device type (simulator or physical device)

## Basic Usage

First, import the API utility:

```typescript
import { api } from '../utils/api';
```

### GET Request

```typescript
// Example: Fetch user data
api.get<UserData>('get_users')
  .then(userData => {
    // Handle success
    console.log('User data:', userData);
  })
  .catch(error => {
    // Handle error
    console.error('Error fetching user data:', error);
  });
```

### POST Request

```typescript
// Example: Create a new user
const userData = {
  email: 'user@example.com',
  name: 'John Doe',
  // ...other fields
};

api.post<{ message: string }>('add_user', userData)
  .then(response => {
    // Handle success
    console.log('User created:', response.message);
  })
  .catch(error => {
    // Handle error
    console.error('Error creating user:', error);
  });
```

### Using with React Hooks

```typescript
import { useState, useEffect } from 'react';
import { api } from '../utils/api';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('get_users')
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Rest of component...
}
```

### Using with TypeScript

The API utility is fully typed. Define interfaces for your response data:

```typescript
interface Product {
  id: string;
  name: string;
  price: number;
}

// The type parameter ensures you get proper type checking
api.get<Product[]>('products')
  .then(products => {
    // products is typed as Product[]
    const firstProduct = products[0];
    console.log(firstProduct.name); // TypeScript knows this exists
  });
```

## Error Handling

The API utility provides consistent error handling. Errors will include:
- Network errors (e.g., server unreachable)
- HTTP status errors (e.g., 404, 500)
- Server-provided error messages when available

Example error handling:

```typescript
api.post('add_user', userData)
  .then(data => {
    // Success
  })
  .catch(error => {
    if (error.message.includes('Network request failed')) {
      // Handle connection errors
      Alert.alert(
        "Connection Error", 
        "Could not connect to the server. Please check your network."
      );
    } else {
      // Handle other API errors
      Alert.alert("Error", error.message);
    }
  });
```

## Debugging

The API utility logs the configured API URL at startup. Check your console logs to verify the correct URL is being used.

If you need to manually override the API URL for testing, you can modify the `getApiUrl` function in `api.ts`.

## Advanced Usage

### Custom Headers

```typescript
// Example: Adding an authorization header
api.get('protected_resource', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### Full Control

If you need more control, you can use the `apiRequest` function directly:

```typescript
import { apiRequest } from '../utils/api';

apiRequest('custom_endpoint', {
  method: 'PATCH',
  headers: { /* custom headers */ },
  body: JSON.stringify(data)
})
``` 