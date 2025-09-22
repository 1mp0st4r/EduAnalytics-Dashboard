<img width="1470" height="832" alt="Screenshot 2025-09-22 at 11 59 37 PM" src="https://github.com/user-attachments/assets/78e4b156-6c07-4138-86e2-160adffedbad" /># PS 25102 - AI-based drop-out prediction and counseling system | SIH Hackathon
Original PS Description: 
Background: By the time term-end marks reveal failures, many struggling students have disengaged beyond recovery. Counsellors and mentors need a mechanism that surfaces risk indicators-faliing attendance, high number of attempts exhausted to pass a particular subject, reducing test scores-weeks earlier. Description: Attendance percentages live in one spreadsheet, test results in another, and fee-payment data in a third. No single view exists to signal that a learner is slipping in multiple areas simultaneously. Commercial analytics platforms promise predictive insights but demand funds and maintenance beyond the reach of public institutes. A simpler, transparent approach would merge existing spreadsheets,apply clear logic to colour-code risk,and notify mentors on a predictable schedule.Such a system must be easy to configure, require minimal training, and empower educators-not replace their judgment. By focusing on data fusion and timely alerts rather than complex algorithms, the institute can intervene early and reduce drop-out rates without fresh budget lines.This challenge epitomises the hackathon spirit: take what is already present, integrate it cleverly, and produce meaningful impact using machine learning. Expected SoIution: Participants are expected to build a consolidated digitaI dashboard that automatically ingests attendance,assessment scores, and other student related dala;applies clear, rule-based thresholds to identify at-risk students; highIights them in an intuitive visual format; and dispatches regular notifications to mentors and guardians, ensuring early,data-driven intervention achieved entirely through suitable machine learning approaches.
This README provides an overview of the project, including team details, relevant links, tasks completed, tech stack, key features, and steps to run the project locally.

## Team Details

**Team Name:** EduAnalytics Team

**Team Leader:** @ParthKay

**Team Members:**

* **Parth Kartikeya Singh** - 2024UIT3122 - @ParthKay - [TEAM LEAD]
* **Umer Talib** - 2024UIT3101 - @1mp0st4r
* **Sneha Sah** - 2023UCS1550 - @Sneha-Sah-22-23
* **Katta Monica** - 2024UIT3107 - @USERNAME
* **Zahid Faizi** - 2024UIT3152 - @zahidfaizi05-droid
* **Kunal Kaim** - 2024UIT3116 - @kunalkaim

## Project Links

* **SIH Presentation:** [Final SIH Presentation](files/presentation.pdf)
* **Video Demonstration:** [Watch Video]([https://youtube.com/watch?v=demo](https://youtu.be/U4dL8GePlug?si=De5_cw_MgZhBmRRJ))
* **Live Deployment:** [View Deployment](https://edu-analytics-dashboard.vercel.app)
* **Source Code:** [GitHub Repository](https://github.com/1mp0st4r/EduAnalytics-Dashboard)
* **Additional Resources:** [Documentation](files/)

## About

EduAnalytics Dashboard is a comprehensive educational analytics platform designed to help institutions identify at-risk students early and implement targeted interventions. The system combines machine learning algorithms, real-time data analysis, and automated notification systems to support student success.

### Key Features

- **📊 Real-time Analytics**: Comprehensive dashboards for students and administrators
- **🤖 AI-Powered Risk Assessment**: Machine learning models to predict dropout probability
- **📧 Automated Notifications**: Email alerts for mentors, parents, and administrators
- **👥 Student Management**: Complete student profile management with academic tracking
- **📈 Performance Monitoring**: Attendance, grades, and behavioral analytics
- **🌐 Bilingual Support**: Hindi and English interface for accessibility
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Tech Stack

**Frontend:**
- Next.js 14 with TypeScript
- Tailwind CSS for styling
- Shadcn/ui component library
- Lucide React for icons

**Backend:**
- Next.js API Routes
- Neon PostgreSQL database
- Node.js runtime

**Machine Learning:**
- Python FastAPI (optional)
- JavaScript fallback algorithms
- Feature engineering for student data

**Email & Notifications:**
- Nodemailer for email delivery
- SMTP integration (Gmail, Outlook)
- Customizable email templates

### Tasks Completed

1. **Database Setup & Integration**
   - Neon PostgreSQL database configuration
   - Student data import from CSV files
   - Mentor assignment system
   - Database connection testing

2. **User Interface Development**
   - Modern, responsive dashboard design
   - Student management interface
   - AI analytics visualization
   - Reports and analytics pages
   - Login and authentication system

3. **AI & Machine Learning**
   - Risk assessment algorithms
   - Dropout probability prediction
   - Student performance analysis
   - Risk explanation system

4. **Email Notification System**
   - SMTP configuration
   - Automated email alerts
   - Email template system
   - Notification management

5. **Deployment & DevOps**
   - Vercel deployment configuration
   - Environment variable management
   - Production optimization
   - Error handling and logging

### Steps to Run Locally

1. **Clone the Repository**
   ```bash
   git clone https://github.com/1mp0st4r/EduAnalytics-Dashboard.git
   cd EduAnalytics-Dashboard
   ```

2. **Install Dependencies**
   ```bash
   cd code
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Database Setup**
   ```bash
   npm run setup
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access Application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Use "Quick Admin Access" or "Quick Student Access" for demo

### Project Structure

```
├── code/                    # Main application code
│   ├── app/                # Next.js app directory
│   ├── components/         # React components
│   ├── lib/               # Utility libraries
│   ├── public/            # Static assets
│   └── scripts/           # Database and setup scripts
├── files/                  # Documentation and resources
│   ├── *.md              # Documentation files
│   ├── *.csv             # Sample data files
│   └── *.pkl             # ML model files
└── README.md             # This file
```

### Live Demo

**🌐 [View Live Application](https://edu-analytics-dashboard.vercel.app/)**

The application is fully deployed and functional with:
- 10,000+ student records
- Real-time analytics
- AI-powered risk assessment
- Email notification system
- Complete student management

### Screenshots

- **Admin Dashboard**: Comprehensive analytics and student management
  <img width="1470" height="832" alt="Screenshot 2025-09-22 at 11 58 50 PM" src="https://github.com/user-attachments/assets/de86c4e1-a280-4606-b92f-ad9bd33ea9ac" />

- **Student Dashboard**: Personalized academic progress tracking
  <img width="1470" height="832" alt="Screenshot 2025-09-22 at 11 59 37 PM" src="https://github.com/user-attachments/assets/9fe89667-6417-4502-980a-cc408c83b68c" />

- **AI Analytics**: Machine learning insights and predictions
  <img width="1470" height="832" alt="Screenshot 2025-09-22 at 11 59 07 PM" src="https://github.com/user-attachments/assets/91e836b5-e344-4946-b774-48d8d9785c41" />

- **Reports**: Detailed analytics and export functionality
   <img width="1470" height="832" alt="Screenshot 2025-09-22 at 11 59 15 PM" src="https://github.com/user-attachments/assets/812144f9-3c97-4787-882c-b6f143f68263" />

### Future Enhancements

- Mobile application development
- Advanced ML models
- Multi-institution support
- Real-time collaboration features
- Integration with existing LMS systems

---

**Made with ❤️ for Education**

[⭐ Star this repo](https://github.com/1mp0st4r/EduAnalytics-Dashboard) | [🐛 Report Bug](https://github.com/1mp0st4r/EduAnalytics-Dashboard/issues) | [💡 Request Feature](https://github.com/1mp0st4r/EduAnalytics-Dashboard/issues)
