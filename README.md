# Shopfront

## What it is

Shopfront is a small shopping app for iPhone, built during the MERN Stack Mobile Hybrid Development bootcamp. People sign in, browse products, add them to a cart, keep a shopping list with locations, and set a profile photo.

## Architecture

The app is Expo (SDK 54) with React Native 0.81, React Navigation 7 and React Native Paper. State lives in Redux Toolkit, with redux-persist saving the cart, the list and the product cache, and tokens kept in the iOS keychain. It talks over Axios to an Express and Mongoose API, hosted on Render, which stores data in MongoDB Atlas. Over-the-air updates come from EAS Update.

## Run it locally

Start the backend (`npm run dev` in the backend repository), then in this project run `npm install` and `npx expo start`, and press `i` for the iOS Simulator. Run the tests with `npm test`. The app reads its API address from `.env` (localhost) in development and `.env.production` in release builds.

## Deployment

The backend repository is https://github.com/paulsskiii/day1-express-fundamentals and its live API is https://shopfront-api-yourname.onrender.com/api/v1 (replace `yourname` with your own). Builds are made with EAS Build (the `preview-simulator` profile for the Simulator) and JavaScript fixes are published with `eas update --channel preview`.

## Demo

See DEMO.md for the eight-minute demo script and its failure plan. A backup video of the same path is kept outside the repository.

## Known limitations and next steps

The free Render service sleeps after about fifteen minutes and takes up to a minute to wake, its disk is temporary so uploaded avatars are lost on every deploy, the M0 Atlas database has no cloud backups, and the app is iOS only. Next steps: store uploads in cloud storage, move to a paid database tier with backups, add real-time updates with Socket.io, and add the improvements your peer asked for in the rehearsal.
