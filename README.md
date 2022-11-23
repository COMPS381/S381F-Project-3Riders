# 3Riders

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
    	"sid": "00000000",
    	"avatar": "$base64stringOfImage" // optional, if not provided default avatar will be used
    }
    ```

3. both the sid and username have to be unique, otherwise the register will fail.
4. using the webpage for registration is recommended, as it is easier to set a user avatar.

#### Admin accounts

Some actions are only allowed for admin accounts, such as deleting a report filed by other users, where normal users are only able to delete their own filed reports.

New users can not register an admin account. And can only be granted the "Admin" role by existing admin accounts.

```json
// this is one of the admin accounts in this demo
{
	"username": "yuzu",
	"password": "0812"
}
```

To grant an account the "Admin" role, login with an admin account and access the page <https://3riders.up.railway.app/sandwich>, the page is hidden and can only be access with direct url.

### Report

1. After login click the report button on the top left bar, a form will pop up, fill in the form and click submit.
2. Also can test report by a `POST` request to <https://3riders.up.railway.app/report>

    ```json
    {
    	"sid": "test report",
    	"name": "test description", // optional
    	"coursecode": "test location", // optional
    	"remarks": "test image" // optional
    }
    ```

### View reports

0. At the login page the last 5 reports will be shown.
1. After login click the list button on the top left bar, two search boxes will be shown, filter the result to your desire, or do not thing and submit to list all.
2. Also can test view reports by a `GET` request to <https://3riders.up.railway.app/list>

    ```json
    {
    	// provide blank string to ignore the filter
    	"search_sid": "",
		"search_name": "",
    	"search_course": ""
    }
    ```

### Delete reports

Normally only the user who filed the report can delete it, but [admin accounts](#admin-accounts) can delete any reports.

1. After login click the list button on the top left bar, a delete button will be shown on the right of each report, click it to delete the report.
2. Also can test delete reports by a `POST` request to <https://3riders.up.railway.app/drop>

    ```json
    {
    	"report_id": "" // same as the _id of the report, easier to get it using the web ui
    }
    ```

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

## Licence

[UNLICENSE](UNLICENSE)
