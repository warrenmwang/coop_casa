# Frontend

This is the code that produces the user interface that interacts with the RESTful API backend to provide
the full functionality of this app. I will try to make the UI as "mobile" friendly as possible, but at the
time of writing, I am not making a certain guarantee, given my lack of CSS skills (or my web dev skills
in general).

## Dev

Javascript package versions are found in the `package.json` file, use those versions if you want things
to work.

To get the dev environment setup from scratch (I hope this works):

```
nvm use
npm install
```

If you are not using nvm, whatever version of Node that I will be using can be found in the `.nvmrc` file.

Yes, I have added the Prettier code formatter for the frontend code, so if ever in need of these
convenient commands (or if you forget, after they have been installed, of course):

```
npx prettier . --check
npx prettier . --write
```
