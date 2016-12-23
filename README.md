# Discovery Trip API

Document Version: v1.0

#### Table of Contents

- [Overview](#overview)
- [Auth Service](#auth-service)
    - [Login](#login)
    - [Password Reminder](#password-reminder)
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
     
     * `grant_type = client_credentials`
     * `username OR email = [string]`
     * `password = [string]`
    
* **Success Response:**
  
  * *Code:* 200
    
   ```json
     {
       "access_token": "c655642186d350d5e3dad7d8e456b1db3eb10bcb688ffddfedce6dead4e642b3",
       "refresh_token": "b3fb150f12ed552cabc86ba207d3c1af23719d1c1ad5a09aa751e8475e7039cd",
       "expires_in": 3600,
       "message": "Access Token acquired with success!",
       "status": "ok",
       "token_type": "Bearer"
     }
   ```
* **Sample Call:**

   ```bash
     curl -i \
       -H "Content-Type: application/json" \
       -X POST -d '{"grant_type": "client_credentials", "username": <USERNAME>, "password": <PASSWORD>}' \
       http://localhost:8080/api/login
   ```

#### **Password Reminder**

Send an e-mail with the user's password, if the user registers in the application by local strategy.

* **URL**

  `/api/login/pwd_reminder`

* **Method:**

   `POST`
  
* **URL Params**

   *Required:*
     
     * `email = [string]`
    
* **Success Response:**
  
  * *Code:* 200
    
   ```json
     {
       "status": "ok",
       "message": "Password reminder sent to user <USERNAME> with success!"
     }
   ```
* **Sample Call:**

   ```bash
     curl -i \
       -H "Content-Type: application/json" \
       -X POST -d '{"email": "example@example.com"}' \
       http://localhost:8080/api/login/pwd_reminder
   ```

#### **Session Refresh**

Refresh the user access token. Refresh token, application id and secret key as input in request body.

* **URL**

  `/api/login`

* **Method:**

   `POST`
  
* **URL Params**

   *Required:*
     
     * `grant_type = refresh_token`
     * `refresh_token = [string]`
     * `client_id = [string]`
     * `client_secret = [string]`
    
* **Success Response:**
  
  * *Code:* 200
    
   ```json
     {
       "access_token": "c655642186d350d5e3dad7d8e456b1db3eb10bcb688ffddfedce6dead4e642b3",
       "refresh_token": "b3fb150f12ed552cabc86ba207d3c1af23719d1c1ad5a09aa751e8475e7039cd",
       "expires_in": 3600,
       "message": "Access Token acquired with success!",
       "status": "ok",
       "token_type": "Bearer"
     }
   ```
* **Sample Call:**

   ```bash
     curl -i \
       -H "Content-Type: application/json" \
       -X POST -d '{"grant_type": "refresh_token", "refresh_token": <TOKEN>, "client_id": <ID>, "client_secret": <KEY>}' \
       http://localhost:8080/api/login
   ```

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
 
     * `username = [string]`
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
       "message": "New User created with success!"
     }
   ```
   
* **Sample Call:**

   ```bash
     curl -i \
       -H "Content-Type: application/json" \
       -X POST -d '{"username": <USERNAME>, "email": <EMAIL>, "password": <PASSWORD>}' \
       http://localhost:8080/api/users
   ```

#### **Get a User**

Lists details of a user present in the application.

* **URL**

  `/api/users/`

* **Method:**

   `GET`
  
* **URL Params**

   *Required:*
 
     * `None`
    
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
     "status": "ok",
     "message": "User found with success!"
   }
  ```
* **Sample Call:**

   ```bash
     curl -i \
       -H "Content-Type: application/json" \
       -H "Authorization: bearer <access_token>" \
       http://localhost:8080/api/users/
   ```

#### **Update a User**

Modifies details of the specified user in the mobile application. 
Valid user with update privilege logged in to the application may modify the user details.

* **URL**

  `/api/users/`

* **Method:**

   `PUT`
  
* **URL Params**

   *Required:*
 
     * `password = [string]`

   *Optional:*
 
     * `username = [string]`
     * `email = [string]`
     * `new_password = [string]`
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
       "message": "User Updated with success!"
     }
   ```
   
* **Sample Call:**

   ```bash
     curl -i \
       -H "Content-Type: application/json" \
       -X PUT -d '{"username": <USERNAME>, "email": <EMAIL>, "password": <PASSWORD>}' \
       http://localhost:8080/api/users/:id
   ```

#### **Remove a User**

Removes a user present in the application based on your ID.

* **URL**

  `/api/users/`

* **Method:**

   `DELETE`
  
* **URL Params**

   *Required:*
 
     * `password = [string]`
    
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
     "status": "ok",
     "message": "User deleted with success!"
   }
  ```
* **Sample Call:**

   ```bash
     curl -i \
       -H "Content-Type: application/json" \
       -H "Authorization: bearer <access_token>" \
       -X DELETE -d '{"password": <PASSWORD>}' \
       http://localhost:8080/api/users/:id
   ```
   
## Errors

All server errors were normalized according to the examples below. 
Each server response identifies the type of error and its cause.

#### **Examples:**

* **Invalid Access Token:**

   ```json
     {"status": "error", "error": "user_error", "error_description": "Invalid Access Token"}
   ```

* **Invalid Request Body:**

   ```json
     {"status": "error", "error": "server_error", "error_description": "Bad request"}
   ```

    