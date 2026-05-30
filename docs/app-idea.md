# Velinya 

It is a Progressive web app designed to run on every major platform i.e. Android, IOS, Web, Mac, Windows, Linux. From one codebase. 

### What does it do 

The app mainly has two features. first, Note taking, second Todos. 

Note taking -> First there are folders then each folder can store notes, each notes will have few things. Title(note title), Description(actual note itself) & at last some metadata (folder, created_at, updated_at)  

Todos -> Each todo will be like this, Todo title, Todo Description, then deadline, is_completed, results field because the todo completed there is a optional field called results to tell what happened after the todo was completed like aftermath outcomes, priority(low, medium, high), metadata(created_at, updated_at).

### How will the app work 

The Entire app is a react app, not just a website it is a PWA. The App is hosted on firebase. The authentication is handled by firebase auth only (google auth is allowed). Every firebase credential will be placed in an .env file, The note, todo Description will be stored as text. and use the server timestamp for date related things dont trust the user. the data in firestore will be stored like this, users->(users_emai_id)->(folder_name)->notes(title, description, etc), and todos users->(users_emai_id)->(1..12)idicating the month->todo(title, description, results, etc). 

### Frontend & designing

The frontend will follow the @docs/wise-design.md build with react.
for routing use react-router v6.30.4 read the @docs/react-router-v6-docs.md for react router documentation. 
shadcn components & tailwind for styling read the @docs/shadcn-vite-docs.md for the shadcn documentation. 
the homepage when logged out-> simple app title with icon. @photos/app-icon.jpg and one-liner description what the app does. then continue with google button. when logged in the UI should look like this. as described below. 

Logged in app UI. 
The Top app bar on the left side toggle between notes(when on notes page there should be a option next to this dropdown to add folder), todos mode using a dropdown. right side the user profile image. 
There is a floating action button on the right bottom side of the screen, that lowers the visibility smoothly when scrolling then brings back up when stopped scrolling on notes taking page it opens a page to enter new notes, on todo page it opens a page for creating new todos, The image on the button is the app icon.
The main area on notes page -> shows folders & on selecting each folder it shows a list of notes title. and on clicking on them it opens the actual note. the floating action button opens up a page to create a new note on top left side there is a dropdown to select folder top right side to save the note. below it an input field to enter single line note title. then big text area to write the notes description
dont upload the note until these three things are provided. 

The main area on the todos page -> right side of note-todo selection dropdown put a month dropdown to select month from 1-12 i.e. January to December. then based on the month there will be a grid of dates that will resize based on the screen, first it will show the dates i.e. from 1-31 or 1-30 etc. and at bottom left side of the grid it show how many todos are there for that days if some todos are pending in that day that specific grid item will turn red if all the todos are completed then it will turn green, upon clicking each day it should show the list of todos for that day with a checkbox button on the right side of each list-item to mark todo completed when a todo is being marked completed then. open a modal with bottom-to-center transition to enter the results. and save the data. at the top of the list show todos that are pending. The floating action button will open a new page to enter a new todo, first at top there will be a date picker to set the deadline of the todo on right side of same row a dropdown to set priority. below a todo title as an input field, then a todo description textarea. and at bottom the save button. 

### Instructions. 

Strictly follow the design file provided
Don't refetch every time someone opens the app. 
use react-query for caching every thing on only refetch when changes occur. use the cache effictively. 
