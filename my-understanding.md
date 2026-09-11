# My Understanding

Answer each question in your own words. There are no trick questions.

The goal is not a perfect answer — it is an honest one. Write as if you are explaining to a friend who has never used Express or React. There is no video for this assessment, so this document is where your understanding is actually assessed — take it seriously.

Do not copy from documentation, your code comments, or AI output. If you are unsure about something, write what you do understand and note where the gap is.

---

## AI Code Contribution

Rate yourself honestly using the scale below. This rating is not scored on its own — there is no "best" number to pick. What matters is that it's honest and matches what your code and your answers actually show.

| Rating | Description |
|---|---|
| 0 | **No AI use.** I did not use AI to generate code, explain concepts, debug, or teach me. |
| 1 | **AI used only for learning.** I did not use AI to generate code, but I used AI to explain concepts, clarify errors, or guide my understanding. |
| 2 | **Mixed coding with AI support.** I wrote some code myself and used some AI-generated code. I also used AI to help me understand, debug, or improve my solution. |
| 3 | **Learned from AI-generated code, then coded myself.** AI generated example code or guidance, but I used that understanding to write or adapt the final code myself. |
| 4 | **AI generated the code, but I fully understand it.** AI generated most or all of the code, but I can explain how it works, why it works, and how the main parts connect. |
| 5 | **AI generated the code with limited understanding.** AI generated most or all of the code, and I cannot confidently explain how or why everything works. |

**My rating:** 3

> If you rated **2 or higher**, also complete the "AI Process" section at the end of this document.

---

## Backend

**1. What does each HTTP method in your API mean — GET, POST, PUT or PATCH, and DELETE? Why do we use different methods instead of just using POST for everything?**

*Your answer:* 

GET reads data, POST creates a new product, PATCH updates an existing product, and DELETE removes a product. Different methods have different purposes for each request. Using POST for everything would make the API harder to understand and would not fitted the standard HTTP behavior.

---

**2. What is `express.json()` and what would happen if you left it out?**

*Your answer:* 

It is middleware that parses incoming JSON request bodies and makes data usable via req.body. Without it, the JSON form submissions can't be parsed to the product fields. The routes will reject the request instead of creating or updating a product.

---

**3. What is the difference between `req.body`, `req.params`, and `req.query`? Give a real example from your API for each one.**

*Your answer:* 

req.body contains submitted data, it contain fields such as "{ "name": "Keyboard", "price": 49.99, "quantity": 1 }"
req.params contains values captured from the route path. For /products/1, req.params.id is "1".
req.query contains query-string options. For /products?search=key&sort=price-asc, req.query.search is "key" and req.query.sort is "price-asc".

---

**4. What are HTTP status codes? List every status code you used in your API and explain why you chose it for that situation.**

*Your answer:* 

HTTP status codes tell the client the result of its request.

200 OK: A successful read, update, or deletion.

201 Created: A new product was successfully saved.

400 Bad Request: Invalid input such as a missing name, negative price, invalid quantity, etc.

404 Not Found: A product ID does not exist, or no API route matches the request.

500 Internal Server Error: An unexpected server or database error occurred.

It is there so that user know the status or errors of each request they made and for developer to debug.

---

**5. What is middleware? Describe what it does in your own words and give one example from your code.**

*Your answer:*

Middleware is a function that runs while Express processes a request. It can check the request, prepare data, send a response, or pass control to the next handler.

The code I used "express.json()" converts incoming JSON into a JavaScript value that my routes can access through req.body. This lets my POST route read the name, price, and quantity sent by React.


---

**6. Why does the order of middleware matter in Express? What could go wrong if it were in the wrong order?**

*Your answer:*

Middleware runs in the order I register it, so each step needs to be in the right place. For example, express.json() must run before my POST route so the route can read the submitted product data from req.body.

My product routes come before the “unknown route” middleware to aboid valid requests could receive a 404 before reaching their route. The error handler comes last so it can handle errors passed from earlier middleware and routes.

---

**7. Walk through what happens on the server, step by step, when a POST request is sent to `/products`.**

*Your answer:*

1. The logger records the method and URL.

2. Middleware adds the response headers.

3. express.json() parses the JSON body and forwards the request to the products router.

4. The POST handler checks that the body is an object, reads name, price, and quantity, and validates the fields. Returns 400 if they are invalid.

5. Product.create() creates and saves the product in MongoDB. The model generates its ID.

6. The server returns 201 with the saved product.

7. If there are any unexpected errors, it passed to the error handler using next(err).

---

**8. What is CRUD? Map each operation to the HTTP method and route you used in your API.**

*Your answer:*

CRUD stands for Create, Read, Update, and Delete.

### Operation and My method and route

Create      POST /products

Read all    GET /products

Read one    GET /products/:id

Update      PATCH /products/:id

Delete      DELETE /products/:id

---

**9. How does your API respond when something goes wrong — for example, when a product with a given ID does not exist?**

*Your answer:*

If a product does not exist, the route returns 404 with a message such as "Product not found". nvalid input returns 400 before data is saved. Unexpected errors are passed to the final error handler, which returns an appropriate response.

---

## Frontend & Integration

**10. What is CORS, and what problem does it solve? What would you see in your browser if it wasn't configured on your server?**

*Your answer:*

CORS stands for Cross-Origin Resource Sharing. It uses HTTP headers to tell the browser which origins may read a server’s responses.
The React app and Express API run on different ports, so they have different origins. The CORS middleware allows the browser’s React code to read API responses.

Without the required CORS headers, the browser would report a CORS error in the Console, and the fetch would fail from React’s perspective.

---

**11. Where does your React app fetch data from your API? Walk through what `useEffect` is doing in that code, and why the fetch isn't just called directly in the component body.**

*Your answer:*

The product list fetches data inside a useEffect in App.jsx. It builds a URL using the applied search and sort values, requests the products, and stores the response in state.

The effect depends on filters and refreshKey. It runs when the component mounts and when either dependency changes. Its cleanup prevents an outdated request from updating state.

The fetch is inside the effect because the component body runs on every render. Putting fetch directly in the body could repeatedly send requests: each response updates state, causing another render and another request.

---

**12. Where is your API's base URL defined, and why did you put it there instead of hardcoding it in every fetch call?**

*Your answer:*

It is defined in the client’s .env file: VITE_API_URL=http://localhost:3000
The components read it through import.meta.env.VITE_API_URL.

This keeps the server address configurable in one place. If the API address changes, I can update the configuration instead of editing every request.

---

**13. Pick one action in your app — for example, deleting a product. Walk through the full round trip: what happens from the moment the user clicks the button, to the request reaching your server, to the screen updating with the new list.**

*Your answer:*

Clicking Delete calls handleDeleteProduct(id). The handler saves the current list and immediately removes the product from React state.
It sends DELETE /products/:id. Express passes the request to the products router, which uses Product.findOneAndDelete() to remove the matching database document.

On success, React keeps the product removed and increments refreshKey to fetch the current filtered and sorted list.
If the request fails, React restores the saved list and shows an error.

---

**14. What does your app show the user while data is loading, and what does it show if the fetch fails (e.g. the server isn't running)? Why does that matter?**

*Your answer:*

While fetching products, the app shows loading message. If fetching fails, it shows an error panel with the message with a Retry button.
Retry changes refreshKey, which triggers another request.

These states tell the user if the app is working, no results, or can't contact the server. Without them, a blank list could be confusing to user.

---

**15. After you add, edit, or delete a product, your on-screen list updates without a page refresh. Explain how — what actually causes React to re-render with the new data?**

*Your answer:*

React renders again when I update component state using a state setter.
After adding or editing, I increment refreshKey. That triggers the fetching effect, which gets the current list and calls setProducts(data).

setProducts() removes the item immediately. Successful requests triggers reconciliation with the API while failed requests restores the previous list.
Updating the database alone does not update what is on the screen. The React state changes can cause the displayed list to change.

---

**16. What was the hardest part of connecting your React app to your Express API, and what did you do to get past it?**

*Your answer:*

The most difficult part was keeping the frontend event handlers and backend routes consistent while adding features.

For example, I renamed the Add handler to handleSaveProduct, but the form still referenced handleAddProduct. React displayed a blank screen because the old function no longer existed. I fixed by debugging with console log and find out what I need to add or rename.

---

## AI Process

Only complete this section if you rated yourself **2 or higher** on the AI Code Contribution Scale above. If you rated 0 or 1, write "N/A" under each question.

**17. If you used AI to generate any code, how did you break the work into steps or prompts? Give one example of a specific prompt you used, rather than a single "build the whole app" request.**

*Your answer:*

I used the AI mainly for frontend because I find it to be the most time-consuming while it wouldn't break any of my backend code. I gave prompt to make it "Apple inspired" to get exactly web design I wanted for this project. The AI haven't break any of my code but I always commit first before prompting big change so I can always rollback.

---

**18. Describe one specific thing an AI tool generated that you changed, corrected, or rejected — and why.**

*Your answer:*

I always corrected AI's message or design decision because it can't always get what I had in mind exactly right. Sometime AI also forgot or unaware what you intended it to behave, I need to be more specific on what I want.

---

**19. Describe one real bug or error you ran into while building this. How did you actually figure out what was wrong, beyond pasting the error back into the chat?**

*Your answer:*

I encountered a blank screen with the error handleAddProduct is not defined. I figured that from reading the browser console log, it was just a minor typo or undefined code so it is fixed pretty quick.

---

**20. Pick one route (backend) or one component (frontend) that AI helped generate. Without looking back at your AI chat history, explain what it does and why it works, in your own words.**

*Your answer:*

I use AI to generate specific design frontend which is resulting in HTML code in app function inside App.jsx and also App.css for design. It works because AI know how to correctly write HTML code to be specific design that is easy for human to understand. The react functions include to make the whole app work flawlessly.