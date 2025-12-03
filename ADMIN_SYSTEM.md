# Admin System & Activity Logging Documentation

## Overview

The CrowdSpark application now includes a comprehensive admin system with user management capabilities and detailed activity logging to track all user interactions.

## Features

### 1. **Admin Role System**
- Users can have either `user` or `admin` role
- Admins have access to special admin dashboard
- Regular users cannot access admin features

### 2. **User Management**
- View all users in the system
- See user status (active/inactive)
- Deactivate/activate user accounts
- View user details and activity
- Prevent admins from deactivating themselves or other admins

### 3. **Activity Logging**
All user actions are automatically logged with:
- User ID, email, and name
- Action type (login, logout, quiz_created, etc.)
- Timestamp
- IP address
- User agent (browser info)
- Additional details specific to each action

### 4. **Admin Dashboard**
- **Overview Tab**: System statistics and metrics
- **Users Tab**: User management interface
- **Quizzes Tab**: View all quizzes from all users
- **Logs Tab**: Activity log viewer

## Logged Actions

The system tracks the following actions:

### Authentication
- `login` - User logs in with email/password
- `logout` - User logs out
- `signup` - New user registration
- `google_login` - User logs in with Google

### Quiz Management
- `quiz_created` - User creates a new quiz
- `quiz_updated` - User updates an existing quiz
- `quiz_deleted` - User deletes a quiz
- `quiz_duplicated` - User duplicates a quiz

### Session Management
- `session_created` - Host creates a new session
- `session_joined` - Participant joins a session
- `session_started` - Host starts the quiz
- `session_ended` - Quiz session ends

### Answers
- `answer_submitted` - Participant submits an answer

### Admin Actions
- `user_deactivated` - Admin deactivates a user
- `user_activated` - Admin activates a user
- `admin_access` - Admin accesses admin features

### Other
- `page_view` - User views a page
- `error` - Error occurred

## How to Create an Admin User

### Method 1: Directly in MongoDB

```javascript
// Connect to MongoDB and update a user
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

### Method 2: Using MongoDB Compass

1. Open MongoDB Compass
2. Connect to your database
3. Navigate to the `users` collection
4. Find your user by email
5. Edit the document and set `role: "admin"`
6. Save changes

### Method 3: Using Mongoose in Node.js

```javascript
const User = require('./models/User');

async function makeAdmin(email) {
  const user = await User.findOne({ email });
  if (user) {
    user.role = 'admin';
    await user.save();
    console.log(`${email} is now an admin!`);
  }
}

makeAdmin('your-email@example.com');
```

## API Endpoints

### Admin Endpoints (Require Admin Role)

All admin endpoints require `userId` in query params or request body for authentication.

#### Get All Users
```
GET /api/admin/users?userId=<admin-user-id>
```

#### Get All Quizzes
```
GET /api/admin/quizzes?userId=<admin-user-id>
```

#### Get Statistics
```
GET /api/admin/stats?userId=<admin-user-id>
```

#### Deactivate User
```
POST /api/admin/users/:userId/deactivate
Body: { userId: "<admin-user-id>" }
```

#### Activate User
```
POST /api/admin/users/:userId/activate
Body: { userId: "<admin-user-id>" }
```

#### Get Activity Logs
```
GET /api/admin/logs?userId=<admin-user-id>&limit=100&skip=0
```

#### Get User Details
```
GET /api/admin/users/:userId?userId=<admin-user-id>
```

## Database Schema Changes

### User Model
```javascript
{
  name: String,
  email: String,
  password: String,
  googleId: String,
  picture: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: Date
}
```

### ActivityLog Model
```javascript
{
  userId: ObjectId (ref: 'User'),
  userEmail: String,
  userName: String,
  action: String (enum of actions),
  details: Mixed (flexible object),
  ipAddress: String,
  userAgent: String,
  timestamp: Date
}
```

### Quiz Model (Updated)
```javascript
{
  title: String,
  description: String,
  type: String,
  questions: [QuestionSchema],
  backgroundImage: String,
  music: String,
  theme: String,
  creatorId: ObjectId (ref: 'User'), // NEW
  creatorEmail: String, // NEW
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

1. **Role-Based Access Control**: Only admins can access admin features
2. **Self-Protection**: Admins cannot deactivate themselves
3. **Admin Protection**: Regular admins cannot deactivate other admins
4. **Active Status Check**: Deactivated users cannot log in
5. **Activity Logging**: All admin actions are logged for audit trail

## Usage Examples

### Accessing Admin Dashboard

1. Log in as an admin user
2. You'll see an "Admin" button in the dashboard header
3. Click it to access the admin dashboard

### Deactivating a User

1. Go to Admin Dashboard
2. Click "Users" tab
3. Find the user you want to deactivate
4. Click the deactivate button (UserX icon)
5. Confirm the action

### Viewing Activity Logs

1. Go to Admin Dashboard
2. Click "Logs" tab
3. View recent activities
4. Filter by user or action type (coming soon)

### Viewing User Details

1. Go to Admin Dashboard
2. Click "Users" tab
3. Click the eye icon next to a user
4. View their quizzes and activity

## Best Practices

1. **Limit Admin Access**: Only give admin role to trusted users
2. **Regular Audits**: Review activity logs regularly
3. **Backup Before Deactivating**: Ensure you have backups before deactivating users
4. **Monitor Admin Actions**: Keep track of who is using admin features
5. **Secure Admin Credentials**: Use strong passwords for admin accounts

## Troubleshooting

### "Access Denied" Error
- Ensure your user has `role: "admin"` in the database
- Log out and log back in after role change

### Activity Logs Not Showing
- Check MongoDB connection
- Ensure ActivityLog model is imported in server
- Check browser console for errors

### Cannot Deactivate User
- Ensure you're not trying to deactivate yourself
- Ensure you're not trying to deactivate another admin
- Check that you have admin privileges

## Future Enhancements

- [ ] Email notifications when users are deactivated
- [ ] Bulk user management
- [ ] Advanced log filtering and search
- [ ] Export logs to CSV
- [ ] User activity analytics and charts
- [ ] Role permissions customization
- [ ] Audit trail export
