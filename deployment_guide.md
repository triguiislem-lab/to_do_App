# 🚀 Deployment Guide: ProTask Dashboard

To deploy your application, you'll need to host the **Backend** (API) and the **Frontend** (React App) separately. Here is the easiest way to do it using free-tier services.

## 1. Prepare your Database (MongoDB Atlas)
Since you are already using MongoDB Atlas, make sure:
- You have updated your `IP Access List` in MongoDB Atlas to `0.0.0.0/0` (Allow access from anywhere) so the cloud server can connect.
- Note down your connection string.

---

## 2. Deploy the Backend (Service: [Render](https://render.com))

Render is a great choice for Node.js backends.

1.  **Push your code to GitHub**.
2.  Login to Render and create a **New Web Service**.
3.  Connect your GitHub repository.
4.  **Set the following fields:**
    - **Root Directory**: `server`
    - **Build Command**: `npm install`
    - **Start Command**: `node server.js`
5.  **Environment Variables**: Add these in the "Env" tab:
    - `MONGODB_URI`: Your Atlas connection string.
    - `PORT`: `5000` (Render will handle this, but 5000 is your current default).
6.  Once deployed, Render will give you a URL (e.g., `https://todo-api.onrender.com`). **Copy this URL**.

---

## 3. Deploy the Frontend (Service: [Vercel](https://vercel.com))

Vercel is the best for React applications.

1.  Login to Vercel and click **Add New Project**.
2.  Import your GitHub repository.
3.  **Configure Project:**
    - **Root Directory**: `client`
    - **Framework Preset**: `Create React App`
4.  **Environment Variables**: 
    - Add a variable named `REACT_APP_API_URL`.
    - Set the value to `https://your-backend-url.onrender.com/api/todos` (The URL you copied from Render).
5.  Click **Deploy**.

---

## 💡 Pro Tips for Production

### CORS Configuration
In `server.js`, you might want to restrict CORS to only your frontend URL for better security:
```javascript
app.use(cors({
  origin: 'https://your-protask-frontend.vercel.app'
}));
```

### Build Check
Before deploying, always test the build locally:
1.  Go to the `client` folder.
2.  Run `npm run build`.
3.  If it succeeds, your code is production-ready!

### Single Deployment Option
If you prefer to deploy everything to one place (Render), you can set up Express to serve your React build. If you want me to help with this "Unified" setup, just let me know!
