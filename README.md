# S381-Project-FreeRiderJail

## Group Information

| Name               | SID      |
| ------------------ | -------- |
| Ng Kwan Yau        | 12311630 |
| Li Chin Pang Kevin | 12244949 |
| Kwok Ka Yau        | 12245633 |

## Program Screenshot

![TODO: Replace this with a real screenshot](/public/docs/Screenshot.png)

## Online demo

<https://3riders.up.railway.app/>

### Login

1. If user have not login before they will be redirected to the login page, then enter your username and password there.
2. Also can test login by a `POST` request to <https://3riders.up.railway.app/login>

   ```json
   {
     "username": "yuzu",
     "password": "0812"
   }
   ```

### Logout

1. Click the avatar on the top right, a logout button pop up under it, click it to logout.
2. Also can test logout by a `GET` request to <https://3riders.up.railway.app/logout>

### Register

1. At the login page, click the register button next to the login button, enter a form to register.
2. Also can test register by a `POST` request to <https://3riders.up.railway.app/register>

   ```json
   {
     "username": "alice",
     "password": "0325",
     "sid": "00000000"
   }
   ```

3. both the sid and username have to be unique, otherwise the register will fail.
4. using the webpage for registration is recommended, as it is easier to set a user avatar.

#### Admin accounts

Some actions are only allowed for admin accounts, such as deleting a report filed by other users, where normal users are only able to delete their own filed reports.

New users can not register an admin account. And can only be granted the "Admin" role by existing admin accounts. (in our demo `yuzu` is an admin account)`)

To grant an account the "Admin" role, login with an admin account and access the page <https://3riders.up.railway.app/sandwich>

## Getting Started

```sh
git clone https://gitlab.com/s3811/S381-Project-FreeRiderJail.git
cd S381-Project-FreeRiderJail
npm install
```

### start program

```sh
npm start
```

### auto reload for development

```sh
npm dev
```

### drop database collections

```sh
npm dropDb
```

## Extra Documentation

[Dracula UI](https://ui.draculatheme.com/)

## Licence

[UNLICENSE](UNLICENSE)
