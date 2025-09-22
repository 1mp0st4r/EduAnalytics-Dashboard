# 🎓 EduAnalytics Dashboard

> **Advanced Educational Analytics and Dropout Prediction System for Institutions**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Neon](https://img.shields.io/badge/Neon-Serverless-00D4AA?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)

## 🌟 Overview

EduAnalytics Dashboard is a comprehensive educational analytics platform designed to help institutions identify at-risk students early and implement targeted interventions. The system combines machine learning algorithms, real-time data analysis, and automated notification systems to support student success.

## 🚀 Recent Updates (Latest)

### ✅ **Fully Functional Production System**
- **Live Deployment**: https://eduanalytics-dashboard.vercel.app
- **Database**: 10,000+ students with Neon PostgreSQL
- **Mentors**: 10 mentors randomly assigned to students
- **Features**: Complete UI/UX overhaul with modern design
- **APIs**: All endpoints working with proper error handling
- **Email**: SMTP integration with Gmail
- **Export**: CSV export functionality for all data

### 🎯 **Key Features Implemented**
- **Admin Dashboard**: Real-time analytics with 10,000+ students
- **Student Dashboard**: Personalized view for individual students
- **Risk Assessment**: AI-powered explanations for risk levels
- **Student Management**: Add, edit, export students with CSV support
- **Mentor System**: 10 mentors with random assignment
- **Reports**: Comprehensive reporting and analytics
- **Notifications**: Functional email system with test capabilities

### 🎯 Key Features

- **📊 Real-time Analytics**: Comprehensive dashboards for students and administrators
- **🤖 AI-Powered Risk Assessment**: Machine learning models to predict dropout probability
- **📧 Automated Notifications**: Email alerts for mentors, parents, and administrators
- **👥 Student Management**: Complete student profile management with academic tracking
- **📈 Performance Monitoring**: Attendance, grades, and behavioral analytics
- **🌐 Bilingual Support**: Hindi and English interface for accessibility
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 🚀 Live Demo

**🌐 [View Live Application](https://eduanalytics-dashboard.vercel.app/)**

## 📸 Screenshots

### Student Dashboard
![Student Dashboard](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Student+Dashboard)

### Admin Analytics
![Admin Dashboard](https://via.placeholder.com/800x400/059669/FFFFFF?text=Admin+Analytics)

### Risk Assessment
![Risk Assessment](https://via.placeholder.com/800x400/DC2626/FFFFFF?text=Risk+Assessment)

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern UI component library
- **Lucide React** - Beautiful icon library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Neon PostgreSQL** - Serverless PostgreSQL database
- **Node.js** - JavaScript runtime

### Machine Learning
- **Python FastAPI** - ML model serving (optional)
- **JavaScript Fallback** - Built-in risk assessment algorithm
- **Feature Engineering** - Comprehensive student data analysis

### Email & Notifications
- **Nodemailer** - Email delivery system
- **SMTP Integration** - Gmail, Outlook, and custom SMTP support
- **Template System** - Customizable email templates

## 📊 Database Schema

The system uses a comprehensive PostgreSQL schema with the following key tables:

- **Students** - Student profiles and academic data (10,000+ records)
- **Schools** - Institution information
- **Mentors** - Teacher/counselor assignments (10 mentors)
- **Users** - Authentication and user management
- **Academic Records** - Grades and performance data
- **Attendance** - Attendance tracking
- **AI Predictions** - ML model results and confidence scores
- **Notifications** - Email delivery logs

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** (Neon recommended for production)
- **Git** for version control

### 1. Clone the Repository

```bash
git clone https://github.com/1mp0st4r/EduAnalytics-Dashboard.git
cd EduAnalytics-Dashboard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database Configuration (Neon PostgreSQL)
DATABASE_URL=postgresql://username:password@hostname:port/database?sslmode=require
NEON_URL=postgresql://username:password@hostname:port/database?sslmode=require

# Email Configuration
FROM_EMAIL=your-email@gmail.com
FROM_NAME=EduAnalytics Support
EMAIL_API_KEY=your_gmail_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

# Application Configuration
NEXT_PUBLIC_API_URL=https://eduanalytics-dashboard.vercel.app
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
```

### 4. Database Setup

```bash
# For local development with Neon PostgreSQL
# 1. Create a Neon account at https://neon.tech
# 2. Create a new database
# 3. Copy the connection string to your .env.local

# Import sample data
npm run import-data

# Populate mentors
npm run populate-mentors
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## 📋 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run import-data  # Import student data from CSV
npm run populate-mentors  # Populate mentor database

# Testing
npm run test         # Run test suite
npm run test:watch   # Run tests in watch mode
```

## 🔧 Configuration

### Email Setup (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings → Security → 2-Step Verification
   - Click "App passwords" → Generate password for "Mail"
   - Use the 16-character password as `EMAIL_API_KEY`

### Database Configuration

The system uses Neon PostgreSQL for production and supports various configurations:

```env
# Neon PostgreSQL (Production)
DATABASE_URL=postgresql://username:password@hostname:port/database?sslmode=require

# Local PostgreSQL (Development)
DATABASE_URL=postgresql://username:password@localhost:5432/database

# Other PostgreSQL providers
DATABASE_URL=postgresql://username:password@your-provider.com:5432/database
```

## 📊 Sample Data

The system comes with 10,000+ synthetic student records from Rajasthan, India, including:

- **Demographic Data**: Age, gender, location, family background
- **Academic Performance**: Grades, attendance, subject-wise scores
- **Socioeconomic Factors**: Income, parental education, technology access
- **Risk Indicators**: Dropout probability, intervention history
- **Mentor Assignments**: 10 mentors randomly assigned to students
- **Class Diversity**: Students across classes 6-12

## 🎯 Use Cases

### For Educational Institutions
- **Early Warning System**: Identify at-risk students before they drop out
- **Resource Allocation**: Optimize mentor assignments and support programs
- **Performance Tracking**: Monitor student progress across multiple metrics
- **Parent Communication**: Automated updates and alerts

### For Students
- **Personal Analytics**: View academic performance and risk factors
- **Mentor Connection**: Direct communication with assigned mentors
- **Support Resources**: Access to help and intervention programs
- **Progress Tracking**: Monitor improvement over time

### For Administrators
- **Institutional Analytics**: School-wide performance metrics
- **Risk Management**: Proactive intervention strategies
- **Reporting**: Comprehensive reports for stakeholders
- **System Management**: User management and configuration

## 🔒 Security Features

- **Environment Variables**: Sensitive data stored securely
- **Input Validation**: Comprehensive data validation
- **SQL Injection Protection**: Parameterized queries
- **Email Security**: SMTP authentication and encryption
- **Error Handling**: Graceful error management

## 🌍 Internationalization

The application supports multiple languages:

- **English** - Primary interface language
- **Hindi** - Regional language support
- **Extensible** - Easy to add more languages

## 📈 Performance

- **Server-Side Rendering**: Fast initial page loads
- **API Optimization**: Efficient database queries
- **Caching**: Smart caching strategies
- **Responsive Design**: Optimized for all devices

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style
- Ensure responsive design

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Rajasthan Education Department** - For providing sample student data
- **Open Source Community** - For the amazing tools and libraries
- **Contributors** - Thank you for your valuable contributions

## 📞 Support

- **Documentation**: [Wiki](https://github.com/1mp0st4r/EduAnalytics-Dashboard/wiki)
- **Issues**: [GitHub Issues](https://github.com/1mp0st4r/EduAnalytics-Dashboard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/1mp0st4r/EduAnalytics-Dashboard/discussions)
- **Email**: support@eduanalytics.gov.in

## 🗺️ Roadmap

### Phase 1 ✅ (Completed)
- [x] Basic dashboard functionality
- [x] Student management system
- [x] Database integration (Neon PostgreSQL)
- [x] Email notification system
- [x] AI risk assessment system
- [x] Mentor management system
- [x] Comprehensive UI/UX overhaul
- [x] Vercel deployment with environment variables
- [x] Risk explanation system
- [x] CSV export functionality
- [x] Student dashboard
- [x] Reports and analytics

### Phase 2 🚧 (In Progress)
- [ ] Advanced ML models
- [ ] Mobile application
- [ ] Real-time analytics
- [ ] Advanced reporting

### Phase 3 📋 (Planned)
- [ ] Multi-institution support
- [ ] Advanced AI features
- [ ] Integration with LMS
- [ ] Predictive analytics

---

<div align="center">

**Made with ❤️ for Education**

[⭐ Star this repo](https://github.com/1mp0st4r/EduAnalytics-Dashboard) | [🐛 Report Bug](https://github.com/1mp0st4r/EduAnalytics-Dashboard/issues) | [💡 Request Feature](https://github.com/1mp0st4r/EduAnalytics-Dashboard/issues)

</div>
