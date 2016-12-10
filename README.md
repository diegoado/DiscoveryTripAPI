# Discovery Trip API

Document Version: v1.0

#### Table of Contents

- [Overview](#overview)
- [Users](#users)
- [Errors](#errors)

## Overview

The web API for DiscoveryTrip Mobile applications.

## Users

#### **Create User**

  Adds a new user to the mobile application. The user name and email is validated to avoid creating duplicates in the application.

* **URL**

  `/api/users`

* **Method:**

   `POST`
  
* **URL Params**

   **Required:**
 
     * `username = [string]`
     * `password = [string]`
     * `email = [string]`

   **Optional:**
 
     * `photo_url = [alphanumeric]`

* **Success Response:**
  
  * **Code:** 200
  * **Content:**
    
    ```json
      {
        "user": {
          "username": "username",
          "email": "email@email.com",
          "id": "584ad1d46ab8be1fcb3a46d1",
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
        -X POST -d '{"username": "someString", "email": "someString@email.com", "password":"someString"}' \
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
  * *Content:*
    
    ```json
      {
        "user": {
          "username": "username",
          "email": "email@email.com",
          "id": "584ad1d46ab8be1fcb3a46d1",
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
  
## Errors

#### Error 400 - BAD REQUEST

The request cannot be fulfilled due to bad syntax.

  * *Content*: 
  
    ```json
      {"status": "error", "message": "Resource validation failed"}
    ```

##### Error 401 - Unauthorized

The request was a legal request, but the server is refusing to respond to it.

  * *Content:*
    ```
      Unauthorized
    ```

##### Error 404 - NOT FOUND

The requested page could not be found a resource.

  * *Content:* 
  
    ```json
      {"status": "error", "message": "Resource not found"}
    ```
    
##### Error 500 - INTERNAL SERVER ERROR 

A generic error message, given when no more specific message is suitable

  * *Content:*
  
    ```json
      {"status": "error", "message": "Internal Server Error"}
    ```