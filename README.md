# Discovery Trip API
The web API for DiscoveryTrip Mobile applications

**Create User**
----
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
          "__v": 0,
          "username": "username",
          "email": "email@email.com",
          "_id": "584ad1d46ab8be1fcb3a46d1",
          "created": "YYYY-MM-DDThh:mm:ss.sssZ"
        },
        "status": "ok",
        "message": "New User created with success"
      }
    ```
 
* **Error Response:**

  * **Code:** 400 BAD REQUEST
  * **Content:** 
  
    ```json
      {"status": "error", "message": "User validation failed"}
    ```
    
  OR
  
  * **Code:** 500 INTERNAL ERROR
  * **Content:** 
  
    ```json
      {"status": "error", "message": "Internal Server Error"}
    ```

* **Sample Call:**

  ```bash
    curl -i \
        -H "Content-Type: application/json" \
        -H "Accept: application/json" \
        -X POST -d '{"username": "someString", "email": "someString@email.com", "password":"someString"}' \
        http://localhost:8080/api/users
  ```
