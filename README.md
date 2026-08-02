# Roommate & Rental Matching Platform (Group 5)

## 🌟 Introduction
Welcome to our **Roommate & Rental Matching Platform** – A smart connection hub built for students! 
This project aims to completely resolve the difficulties students face when looking for accommodations and compatible roommates. Unlike traditional Facebook groups or generic rental websites, our system not only provides rental listings but also integrates an advanced **Matching Algorithm** based on lifestyle, daily habits, and budget to recommend the highly compatible roommates.

---

## 🚀 How It Works
The platform operates through a secure and tightly integrated connection process:
1. **Identity Verification:** Students registering for an account are strictly verified through an integrated Blacklist system to prevent spam and frauds.
2. **Lifestyle Survey:** Users fill out a detailed profile regarding their sleep schedule, cleaning frequency, pet preferences, etc.
3. **Data Analysis:** Our Weighted Scoring Algorithm processes the data and generates a list of the most suitable candidates (MatchScore > 50%).
4. **Connect & Chat:** Direct, secure messaging within the platform featuring a Real-time notification system.
5. **Distance Geocoding:** The Multi-layer Map Matching Algorithm accurately calculates the real distance to campuses/rentals while applying Coordinate Fuzzing to obfuscate exact locations, ensuring student safety and privacy against stalkers.

🎥 **Watch the Demo Video here:** [Click to watch Demo Video on Google Drive](https://drive.google.com/file/d/1zM9-svYqr5ye1I0VI8TCpdj1OPWPHmoK/view?usp=sharing)

---

## 📖 User Guide
To start using the platform, follow these simple steps:
1. **Create an Account:** Go to the Registration page, enter your email and password.
2. **Complete your Profile:** Update your personal information and, most importantly, fill out the **Lifestyle Profile** as honestly as possible.
3. **Find a Roommate:** Navigate to the *Roommate Matching* feature. The system will automatically suggest the best candidates for you along with detailed matching reasons.
4. **Find a Rental:** Go to the *Rentals* page to browse available rooms. You can filter by distance, price, and amenities.
5. **Chat:** Click the "Message" button on a roommate profile or rental post to communicate directly and safely without giving out your personal phone number or social media accounts.

---

## 💻 Developer Guide (Local Setup)
To download the source code and run the project locally, please follow these steps:

**1. Prerequisites**
- Node.js (v18.x or higher)
- `npm` package manager

**2. Installation**
Open your Terminal, navigate to your desired directory, and clone the repository:
```bash
git clone -b main --single-branch https://github.com/XuanDuong1905/TDTT-Gruop5-Web-t-m-tr-.git .
```

**3. Install Dependencies**
```bash
npm install
```
*(This command will also automatically generate the Prisma ORM client for you).*

**4. Environment Variables**
Create a `.env` file in the root directory of the project and insert the Aiven Cloud database connection string:
```env
DATABASE_URL="mysql://avnadmin:AVNS_U_yPih-oVbJ7s5L210s@ghep-tro-db-student-65bd.h.aivencloud.com:15469/defaultdb?ssl-mode=REQUIRED"
```

**5. Run the Local Server**
```bash
npm run dev
```
Open `http://localhost:3000` in your browser to experience the application.

---

## 🤝 Contributing
This project is an open-source academic product, and we always welcome new ideas! If you would like to contribute (fix bugs, add features, optimize UI):
1. **Fork** this repository to your account.
2. **Create a new Branch** for your feature (`git checkout -b feature/amazing-feature`).
3. **Commit** your changes (`git commit -m 'Add amazing feature'`).
4. **Push** to the branch (`git push origin feature/amazing-feature`).
5. Open a **Pull Request** and we will review it as soon as possible!

Every contribution, no matter how small, helps make the student rental community better!

---

## 🙏 Acknowledgements
- A sincere thank you to our **Instructing Professor** for the dedicated guidance, support, and direction in helping our group successfully complete this Computational Thinking coursework.
- Thank you to all the members of **Group 5** for staying up late, waking up early, and collaborating seamlessly to turn an idea on paper into a functional platform.
- Lastly, thank you to the students who participated in the beta testing and provided invaluable feedback to help perfect the product.
