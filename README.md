# Discovery Trip API

Document Version: v1.0

#### Table of Contents

- [Overview](#overview)
- [Auth Service](#auth-service)
    - [Login](#login)
    - [Login by Facebook](#login-by-facebook)
    - [Password Reminder](#password-reminder)
    - [Session Refresh](#session-refresh)
    - [Logout](#logout)
- [Users](#users)
    - [Create](#create-a-user)
    - [Read](#read-a-user)
    - [Update](#update-a-user)
    - [Delete](#delete-a-user)
- [Attractions](#attractions)
    - [Create](#create-a-attraction)
    - [Read](#read-a-attraction)
    - [Update](#update-a-attraction)
    - [Delete](#delete-a-attraction)
- [Events](#events)
    - [Create](#create-a-event)
- [Photos](#photos)
    - [Download](#download-a-photo)
- [Searches](#searches)
    - [Attraction by Localization](#attraction-by-localization)
- [Errors](#errors)

## Overview

The web API for DiscoveryTrip Mobile applications.

## Auth Service

Authentication service provides REST APIs to login, reconnect to an existing session, and terminate a session (logout). 
The login API returns a token on successful authentication. 
The reconnect and logout REST APIs require a session token in the request header.

#### **Login**

Authenticate user with specified credentials. Username or Password and password as input in request body.

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
       "access_token": "<access_token>",
       "refresh_token": "<refresh_token>",
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
       -X POST -d '{"grant_type": "client_credentials", "username": <username>, "password": <password>}' \
       http://localhost:8080/api/login
   ```

#### **Login by Facebook**

Authenticate user using facebook as provider. Username or Password and password as input in request body.

* **URL**

  `/api/facebook/login`

* **Method:**

   `POST`
  
* **URL Params**

   *Required:*
     
     * `access_token = [string] <- Access Token provide by Facebook`
    
* **Success Response:**
  
  * *Code:* 200
    
   ```json
     {
       "status": "ok",
       "message": "User authentication by Facebook completed with success!"
     }
   ```
   
* **Sample Call:**

   ```bash
     curl -i \
       -H "Content-Type: application/json" \
       -X POST -d '{"access_token": "<access_token>"}' \
       http://localhost:8080/api/facebook/login
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
       "message": "Password reminder sent to user <username> with success!"
     }
   ```
   
* **Sample Call:**

   ```bash
     curl -i \
       -H "Content-Type: application/json" \
       -X POST -d '{"email": "<email>"}' \
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
       "access_token": "<access_token>",
       "refresh_token": "<refresh_token>",
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
       -X POST -d '{"grant_type": "refresh_token", "refresh_token": <token>, "client_id": <id>, "client_secret": <key>}' \
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
       -H "Authorization: bearer <access_token>" \
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
         "id": "<id>",
         "username": "<username>",
         "email": "<email>",
         "photo_url": "<photo_url>",
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
       -X POST -d '{"username": <username>, "email": <email>, "password": <password>}' \
       http://localhost:8080/api/users
   ```

#### **Read a User**

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
       "id": "<id>",
       "username": "<name>",
       "email": "<email>",
       "photo_url": "<photo_url>",
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
         "id": "<id>",
         "username": "<username>",
         "email": "<email>",
         "photo_url": "<photo_url>",
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
       -X PUT -d '{"username": <username>, "email": <email>, "password": <password>}' \
       http://localhost:8080/api/users/:id
   ```

#### **Delete a User**

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
       "id": "<id>",
       "username": "<name>",
       "email": "<email>",
       "photo_url": "<photo_url>",
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
       -X DELETE -d '{"password": <password>}' \
       http://localhost:8080/api/users/:id
   ```

## Attractions

#### **Create a Attraction**

Adds a new tourist attraction to the mobile application. 
The latitude and longitude is validated to avoid creating duplicates in the application.

* **URL**

  `/api/attractions/`

* **Method:**

   `POST`
  
* **URL Params**

   *Required:*
 
     * `name        = [string]`
     * `description = [string]`
     * `latitude    = [string]  <- In ISO 6709 format`
     * `longitude   = [string]  <- In ISO 6709 format`
     * `photos      = [blob]    <- At least one photo and a maximum of 10 photos`
     
   *Optional:*
      
     * `category     = [string] <- One of then [beaches, island resorts, parks, forests, monuments, temples, zoos, 
                                                aquariums, museums, art galleries, botanical gardens, castles, libraries,
                                                prisons, skyscrapers, bridges]`
    
* **Success Response:**
  
  * *Code:* 200
    
  ```json
   {
     "attraction": {
       "_id": "id",
       "name": "attraction name", 
       "description": "some description to new attraction",
       "localization": { 
         "_id": "id",
         "longitude": "X.XXX", 
         "latitude": "XX.XXX" 
       },
       "photos":["photo_id1", "photo_id2", "..."],
       "state":"In Approval",
       "created":"YYYY-MM-DDThh:mm:ss.sssZ"
     },
     "status":"ok",
     "message":"New Tourist Attraction created with success"
   }
  ```

* **Sample Call:**

  ```bash
    curl -i -X POST  \
      -H "Content-Type: multipart/form-data" \
      -H "Authorization: bearer accessToken" \
      -F "name=attraction name" \
      -F "description=some description to new attraction" \ 
      -F "latitude=XX.XXX" -F "longitude=X.XXX"  \
      -F "photos=@path_to_image1" \
      -F "photos=@path_to_imageN" \
      http://localhost:8080/api/attractions
  ```

#### **Read a Attraction**

Lists details of a user attraction in the application.

* **URL**

  `/api/attractions/:id`

* **Method:**

   `GET`
  
* **URL Params**

   *Required:*
 
     * `None`
    
* **Success Response:**
  
  * *Code:* 200
    
  ```json
   {
     "attraction": {
       "_id": "id",
       "name": "attraction name",
       "description": "some description to attraction",
       "localization": {
         "_id": "id",
         "latitude": "XX.XXX",
         "longitude": "X.XXX",
         "city": "city",
         "country": "country",
         "countryCode": "countryCode",
         "streetName": "streetName",
         "streetNumber": "streetNumber",
         "zipcode": "XXX"
       },
       "photos": [
         "id1", "id2", "...", "idN"
       ],
       "state": "In Approval",
       "created": "2017-02-12T05:03:02.782Z"
     },
     "status": "ok",
     "message": "Attraction found with success"
   }
  ```
  
* **Sample Call:**

   ```bash
     curl -i \
       -H "Content-Type: application/json" \
       -H "Authorization: bearer <access_token>" \
       http://localhost:8080/api/attractions/:id
   ```
   
#### **Delete a Attraction**

Removes a attraction present in the application based on your ID.

* **URL**

  `/api/attractions/:id`

* **Method:**

   `DELETE`
  
* **URL Params**

   *Required:*
 
     * `id = [string]`
    
* **Success Response:**
  
  * *Code:* 200
    
  ```json
   {
     "attraction": {
       "_id": "id",
       "name": "attraction name", 
       "description": "some description to new attraction",
       "localization": "id",
       "photos": ["photo_id1", "photo_id2", "..."],
       "state": "In Approval",
       "created":"YYYY-MM-DDThh:mm:ss.sssZ"
     },
     "status": "ok",
     "message": "Attraction deleted with success!"
   }
  ```
  
* **Sample Call:**

   ```bash
     curl -i \
       -H "Content-Type: application/json" \
       -H "Authorization: bearer <access_token>" \
       -X DELETE \
       http://localhost:8080/api/attractions/:id
   ```

## Events

#### **Create a Event**

* **URL**

  `/api/events`

* **Method:**

   `POST`
  
* **URL Params**

   *Required:*
 
     * `name        = [string]`
     * `description = [string]`
     * `endData     = [string]  <- In ISO Date format`
   
   *Optional:*
   
     * `photo     = [file]`
     * `kind      = [String]     <- Public|Private`
     * `price     = [Number]`
     * `keywords  = [Array of Strings]`
     * `startDate = [String]     <- In ISO Date format`
    
* **Success Response:**
  
  * *Code:* 200
    
  ```json
   {
     "event": {
       "name": "attraction name", 
       "description": "some description to new event",
       "attraction": "attraction_id",
       "photo": "photo_id",
       "kind": "public",
       "price": "0",
       "keywords": ["keyword1", "...", "keywordN"],
       "startDate": "YYYY-MM-DDThh:mm:ss.sssZ",
       "endDate": "YYYY-MM-DDThh:mm:ss.sssZ",
       "created":"YYYY-MM-DDThh:mm:ss.sssZ"
     },
     "status":"ok",
     "message":"New Event created with success"
   }
  ```

* **Sample Call:**

  ```bash
    curl -i -X POST \
      -H "Content-Type: multipart/form-data" \
      -H "Authorization: bearer accessToken" \
      -F "name= event name" \
      -F "description=some description to new event" \ 
      -F "keywords[]=keyword1" \
      -F "keywords[]=keywordN" \
      -F "startDate=YYYY-MM-DDThh:mm:ss.sssZ" \
      -F "endDate=YYYY-MM-DDThh:mm:ss.sssZ" \
      -F "photo=@path_to_eventImage" \ 
      http://localhost:8080/api/events
  ```
  
## Photos

#### **Download a Photo**

Download a photo of one event or attraction in the application.

* **URL**

  `/api/photos/:id/download`

* **Method:**

   `GET`
  
* **URL Params**

   *Required:*
 
     * `id = [string] <- the photo id in the application`
    
* **Success Response:**
  
  * *Code:* 200
  
   `attachment; filename=file.extension`
  
* **Sample Call:**

   ```bash
     curl -i \
       -H "Content-Type: application/json" \
       -H "Authorization: bearer <access_token>" \
       http://localhost:8080/api/photos/:id/download/
   ```
   
## Search

#### **Attraction by Localization**

Search attractions near to a localization around a determinate input radius (in meters)

* **URL**

  `/api/search/attraction`

* **Method:**

   `GET`
  
* **URL Params**

   *Required:*
 
     * `latitude  = [string] <- In ISO 6709 format`
     * `longitude = [string] <- In ISO 6709 format`
     * `distance  = [number] <- Default: 5000m`
    
* **Success Response:**
  
  * *Code:* 200
  
   ```json
   {
     "attractions": [
       {
         "_id": "id",
         "name": "attraction name",
         "description": "some description to attraction",
         "localization": {
           "_id": "id",
           "latitude": "XX.XXX",
           "longitude": "X.XXX",
           "city": "city",
           "country": "country",
           "countryCode": "countryCode",
           "streetName": "streetName",
           "streetNumber": "streetNumber",
           "zipcode": "XXX"
         },
         "photos": ["id1", "id2", "...", "idN"],
         "state": "In Approval",
         "created": "2017-02-12T05:03:02.782Z"
       }
     ],
     "status": "ok",
     "message": "Were found attractions near the input coordinates"
   }
   ```
  
* **Sample Call:**

   ```bash
     curl -i \
       -H "Content-Type: application/json" \
       -H "Authorization: bearer <access_token>" \
       http://localhost:8080/api/search/attraction?latitude=latitude&longitude=longitude&distance=5000
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

    
