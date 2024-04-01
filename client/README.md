## Run the Extension locally

### 1. Project setup

Clone the repository to your local machine:

```bash
git clone git@github.com:AzumoHQ/contacts-sync.git
```

Navigate to the project directory:

```bash
cd contacts-sync/client
```

Rename the `sample.env` file to `.env`, and populate the environment variables.

In the project directory, you can run:

### 2. Install project dependencies

```bash
npm i
```

### 3. Run the react app

```bash
npm start
```

## Build the Web Extension

### 1. Project setup

Setup the `API_URL` in `.env` with your api url. Please follow the same structure as the `sample.env`. Pay special attention to the last bar. Enter only the domain

### 2. Build the extension

```bash
npm run build
```

In the folder called `client/build` you will have the unpacked version of the extension.