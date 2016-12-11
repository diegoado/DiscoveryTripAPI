# Discovery Trip API

Document Version: v1.0

#### Table of Contents

- [Overview](#overview)
- [Auth Service](#auth-service)
    - [Login](#login)
    - [Session Refresh](#session-refresh)
    - [Logout](#logout)
- [Users](#users)
    - [Create](#create-a-user)
    - [Remove](#remove-a-user)
    - [Update](#update-a-user)
    - [Get](#get-a-user)
- [Errors](#errors)

## Overview

The web API for DiscoveryTrip Mobile applications.

## Auth Service

Authentication service provides REST APIs to login, reconnect to an existing session, and terminate a session (logout). 
The login API returns a token on successful authentication. 
The reconnect and logout REST APIs require a session token in the request header.

#### **Login**

Authenticate user with specified credentials. Username or Password and password and as input in request body.

* **URL**

  `/api/login`

* **Method:**

   `POST`
  
* **URL Params**

   *Required:*
     
     * `grant_type = password`
     * `username OR email = [string]`
     * `password = [string]`
     * `client_id = [string]`
     * `client_secret = [string]`
    
* **Success Response:**
  
  * *Code:* 200
    
   ```json
     {
       "access_token": "c655642186d350d5e3dad7d8e456b1db3eb10bcb688ffddfedce6dead4e642b3",
       "refresh_token": "b3fb150f12ed552cabc86ba207d3c1af23719d1c1ad5a09aa751e8475e7039cd",
       "expires_in": 3600,
       "token_type": "Bearer"
     }
   ```
* **Sample Call:**

   ```bash
      curl -i \
        -H "Content-Type: application/json" \
        -X POST -d '{"grant_type": "password", "username": "someString", "password": "someString",' \
           '"client_id": "someString", "client_secret: "someString"}' \
        http://localhost:8080/api/login
   ```
  
#### **Session Refresh**

#### **Logout**

Remove User session by invoking an explicit logout. Session token to be provided in request header.

* **URL**

  `/api/logout`

* **Method:**

   `DELETE`
  
* **URL Params**
    
   `None`
    
* **Success Response:**
  
  * *Code:* 200
    
   ```json
     {
       "status": "ok",
       "message": "User logout completed with success!"
     }
   ```
* **Sample Call:**

   ```bash
      curl -i \
        -H "Content-Type: application/json" \
        -H "Authorization: bearer fe4b6b458906fd6b9dad77a06bed82597bd16dd790a8f48d99f52d8975610c71" \
        -X DELETE \
        http://localhost:8080/api/logout
   ```
    
## Users

#### **Create a User**

Adds a new user to the mobile application. 
The user email is validated to avoid creating duplicates in the application.

* **URL**

  `/api/users`

* **Method:**

   `POST`
  
* **URL Params**

   *Required:*
 
     * `name = [string]`
     * `password = [string]`
     * `email = [string]`

   *Optional:*
 
     * `photo_url = [alphanumeric]`

* **Success Response:**
  
  * *Code:* 200
 
   ```json
     {
       "user": {
         "id": "584c2c99632e7b325f9e696e",
         "username": "username",
         "email": "email@example.com",
         "photo_url": "photo_url",
         "created": "YYYY-MM-DDThh:mm:ss.sssZ"
       },
       "status": "ok",
       "message": "New User created with success"
     }
   ```
   
* **Sample Call:**

   ```bash
      curl -i \
        -H "Content-Type: application/json" \
        -X POST -d '{"name": "someString", "email": "someString@email.com", "password":"someString"}' \
        http://localhost:8080/api/users
   ```

#### **Get a User**

Lists details of a user present in the application.

* **URL**

  `/api/users/:id`

* **Method:**

   `GET`
  
* **URL Params**

   *Required:*
 
     * `id = [string]`
    
* **Success Response:**
  
  * *Code:* 200
    
  ```json
   {
     "user": {
       "id": "584c2c99632e7b325f9e696e",
       "username": "name",
       "email": "email@example.com",
       "photo_url": "photo_url",
       "created": "YYYY-MM-DDThh:mm:ss.sssZ"
     },
     "status": "ok"
   }
  ```
* **Sample Call:**

   ```bash
      curl -i \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer access_token" \
        http://localhost:8080/api/users/:id
   ```

#### **Update a User**

Modifies details of the specified user in the mobile application. 
Valid user with update privilege logged in to the application may modify the user details.

#### **Remove a User**

Removes a user present in the application based on your ID.
  
## Errors

#### **Error 400 - Bad Request**

The request cannot be fulfilled due to bad syntax.


   ```json
     {"status": "error", "message": "Resource validation failed"}
   ```

##### **Error 401 - Unauthorized**

The request was a legal request, but the server is refusing to respond to it.

   ```
     Unauthorized
   ```

##### **Error 403 - Forbidden**

   ```json
     {"error": "invalid_grant", "error_description": "Invalid resource owner credentials"}
   ```

##### **Error 404 - Not Found**

The requested page could not be found a resource.

   ```json
     {"status": "error", "message": "Resource not found"}
   ```
    
##### **Error 500 - Internal Server Error** 

A generic error message, given when no more specific message is suitable

   ```json
     {"status": "error", "message": "Internal Server Error"}
   ```