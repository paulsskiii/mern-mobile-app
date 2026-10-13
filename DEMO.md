# Shopfront demo script (8 minutes)

1. (0:00) One sentence: what Shopfront is and who it is for. Behind the screen: nothing yet, I am just framing the story.
2. (0:30) Open the installed app. Show the About screen: live API address and update ID. Behind the screen: the address comes from the production environment file, and the update ID comes from expo-updates.
3. (1:00) Register a new account and sign in. Behind the screen: the app calls the register and login routes on the Render API, which stores the user in the production Atlas database and returns tokens.
4. (1:45) Browse the products and open one. Behind the screen: the list is fetched with the access token and the images are cached on the phone.
5. (2:30) Add two items to the cart. Show the badge. Behind the screen: the cart lives in Redux on the phone, so no request is sent.
6. (3:15) Use one native feature: show the location. Behind the screen: the app asks iOS for permission with our own wording, then reads the position.
7. (4:00) Close the app completely and reopen it. Still signed in. Behind the screen: the refresh token is kept in the iOS keychain, and the cart is restored from storage.
8. (4:30) Architecture slide: app, Render API, Atlas. Say one trade-off: the free Render plan sleeps, so the first request after a pause is slow.
9. (6:30) What I would build next.
10. (7:30) Questions.

**If something fails:** say "the server is waking up, this is the free-tier cold start", wait a few seconds, and if it still fails, play the backup video (demo.mov on my Desktop) and narrate it with the same steps.
