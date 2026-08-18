# 🎓 UniPulse

### Student Success & Academic Intelligence Platform

**UniPulse** is a full-stack, data-driven university platform that combines **academic management, student progress monitoring, data analytics, and decision-support capabilities** in a single system.

Traditional university systems mainly focus on storing information such as student registrations, module enrollments, attendance, assessment marks, and examination results. UniPulse goes beyond simple record management by analyzing academic data and transforming it into meaningful insights for students, lecturers, academic advisors, and university administrators.

The project is designed to demonstrate practical skills in both **Full-Stack Software Engineering** and **Data Analytics**.

---

## 📌 Project Overview

Universities generate large amounts of academic data throughout a student's degree program, including:

* Student registrations
* Program and module enrollments
* Attendance records
* Assignment and quiz results
* Examination marks
* GPA records
* Learning activities
* Repeated modules
* Academic interventions

However, simply storing this information does not help users fully understand student academic progress.

A student may gradually show patterns such as decreasing attendance, lower assessment performance, missed submissions, and declining engagement before eventually experiencing serious academic difficulties.

UniPulse provides a more proactive approach by continuously analyzing academic information and presenting useful academic insights.

The platform combines:

* Academic data management
* Student and lecturer dashboards
* Attendance and assessment management
* Academic performance analytics
* GPA and grade planning
* Academic attention indicators
* Academic intervention management
* Data processing and ETL
* Statistical and exploratory analysis
* Power BI reporting
* Optional predictive analytics

---

## 🎯 Main Objective

The main objective of UniPulse is to develop a secure, responsive, full-stack university platform that manages academic information and transforms student data into actionable insights for:

* Monitoring academic performance
* Supporting student academic planning
* Identifying potential academic difficulties
* Supporting lecturers and academic advisors
* Analyzing module and assessment performance
* Improving institutional decision-making

---

## 👥 User Roles

UniPulse supports four main user roles:

### 🎓 Student

Students can:

* View enrolled modules
* View assessment results
* View attendance
* Monitor GPA
* View semester performance
* Analyze academic trends
* Set grade goals
* Use the What-If Grade Simulator
* Use the GPA Goal Planner
* View Academic Health information
* View their Academic Progress Twin
* Receive academic recommendations and notifications

### 👨‍🏫 Lecturer

Lecturers can:

* Manage assigned modules
* View enrolled students
* Create assessments
* Enter assessment results
* Record attendance
* View class performance analytics
* Analyze grade distributions
* Identify students who may require academic attention
* Create academic support interventions
* Monitor intervention progress

### 🧑‍💼 Academic Advisor

Academic advisors can:

* View assigned students
* Review student progress
* View academic attention indicators
* Analyze performance trends
* Record academic interventions
* Add advisor notes
* Schedule follow-ups
* Monitor intervention outcomes

### 🏛️ Administrator / Department Head

Administrators can:

* Manage users
* Manage faculties and departments
* Manage academic programs
* Manage semesters and modules
* View institutional analytics
* Compare programs and cohorts
* Analyze module performance
* Monitor academic attention statistics
* Generate reports
* Monitor academic data quality

---

# ✨ Key Features

## 🪞 Academic Progress Twin

The **Academic Progress Twin** is one of the main features of UniPulse.

It provides a continuously updated representation of a student's current academic condition using several indicators.

Example:

```text
Academic Progress Twin

GPA                 3.24
Attendance          82%
Assessment Average  74%
Submission Rate     91%
Engagement          69%
Credits Completed   64

Academic Health     76 / 100
Trend               Improving
```

The Progress Twin is recalculated when new academic information becomes available, allowing students and advisors to quickly understand overall academic progress.

---

## ❤️ Academic Health Score

UniPulse provides an explainable **Academic Health Score** based on multiple academic indicators.

Example factors:

```text
Academic Performance    40%
Attendance              20%
Submission Completion   15%
Engagement              15%
Performance Trend       10%
```

Example:

```text
Performance = 78
Attendance = 82
Submission = 90
Engagement = 68
Trend = 70

Academic Health Score = 78 / 100
```

The scoring method is designed to remain transparent and configurable.

---

## 🎯 What-If Grade Simulator

The **What-If Grade Simulator** allows students to determine the marks required in remaining assessments to achieve a target grade.

Example:

```text
Target Grade: B+

Assignments = 72 × 20% = 14.4
Midterm     = 61 × 30% = 18.3

Current Contribution = 32.7

Required Total = 70

Required Final Examination Mark ≈ 75%
```

Students can also explore multiple possible outcomes.

```text
Final = 60 → Overall = 62.7
Final = 70 → Overall = 67.7
Final = 75 → Overall = 70.2
Final = 80 → Overall = 72.7
Final = 90 → Overall = 77.7
```

---

## 📈 GPA Goal Planner

The **GPA Goal Planner** allows students to define a target GPA and explore possible grade combinations that could help achieve it.

Example:

```text
Current Projected GPA: 3.19
Target GPA:            3.50

Projected Scenario:    3.51
```

This allows students to plan their academic performance more effectively.

---

## ⚠️ Academic Attention Indicator

UniPulse provides an explainable **Academic Attention Indicator** for identifying academic patterns that may suggest a student requires additional support.

Possible signals include:

```text
Attendance < 60%                 +30
Current Average < 50%            +30
Two or More Missed Assessments   +20
Declining Performance            +10
Low Engagement                   +10
```

Attention levels:

```text
0–29      LOW
30–59     MEDIUM
60–100    HIGH
```

Instead of making statements such as:

> "This student will fail."

UniPulse provides decision-support information such as:

> "Current academic patterns suggest that this student may require additional academic attention."

This keeps the system transparent and supportive rather than making automatic academic decisions.

---

## 📉 Assessment Difficulty Analyzer

UniPulse analyzes assessment-level performance to identify comparatively challenging assessments.

Example:

```text
Assessment       Average

Quiz 1           78%
Assignment 1     73%
Quiz 2           69%
Midterm          48%
Assignment 2     75%
```

The system may identify:

```text
Possible Difficult Assessment

Midterm Examination
Class Average: 48%
```

If topic-level information is available, UniPulse can also identify areas where students perform poorly.

```text
Topic               Average

SQL Basics          81%
Joins               67%
Normalization       43%
Transactions        57%
Indexing            52%
```

This can help lecturers identify topics that may require additional teaching support.

---

## 📚 Module Difficulty Analysis

UniPulse can calculate a **Module Difficulty Index** using academic indicators such as:

* Failure rate
* Average result
* Repeat rate
* Withdrawal rate
* Grade distribution

Example:

```text
Advanced Statistics     82
Algorithms               79
Database Systems         63
Economics                50
Web Development          44
```

The purpose is not to label modules as objectively difficult, but to identify comparatively challenging academic patterns.

---

## 📊 Academic Performance Analytics

UniPulse analyzes academic performance across different levels.

Analytics include:

* Student performance over time
* Module performance
* Assessment performance
* Grade distributions
* Semester comparisons
* Program performance
* Pass rates
* Failure rates
* GPA trends

These analytics help users understand both individual student performance and broader academic patterns.

---

## 📅 Attendance Analytics

The platform analyzes:

* Overall attendance
* Attendance by module
* Attendance trends
* Attendance by semester
* Relationships between attendance and academic performance

Example:

```text
Attendance Range       Average Result

90–100%                79%
80–89%                 73%
70–79%                 67%
60–69%                 60%
Below 60%              52%
```

The platform treats these as observed relationships and avoids incorrectly presenting correlation as causation.

---

## 🤝 Academic Intervention Management

Lecturers and academic advisors can create and manage academic-support interventions.

Possible intervention types include:

* Lecturer consultation
* Academic advising
* Peer tutoring
* Additional tutorials
* Revision sessions
* Study-planning assistance

Example:

```text
Student:       ST12345
Module:        Database Systems
Intervention:  Academic Consultation
Reason:        Declining Assessment Performance
Status:        OPEN
```

Follow-ups can be scheduled and intervention outcomes can be monitored.

---

## 📊 Intervention Outcome Analytics

UniPulse can analyze observed outcomes following academic-support interventions.

Example:

```text
Intervention              Students    Improvement Observed

Peer Tutoring             120         78%
Extra Tutorial             75         72%
Academic Consultation      95         67%
Revision Session           68         61%
```

These results are presented as observed relationships rather than proof that an intervention directly caused an improvement.

---

## 🕒 Student Journey Timeline

Each student can have a chronological academic journey showing important changes and events.

Example:

```text
September
● Semester Started

October
● Attendance 91%

November
⚠ Attendance decreased to 73%

December
⚠ Statistics quiz performance decreased

January
● Advisor consultation recorded

February
✓ Attendance increased to 84%

March
✓ Statistics performance improved
```

This allows academic progress to be understood as an ongoing journey rather than a collection of isolated results.

---

## 👥 Cohort Analytics

Administrators can compare academic performance between different student groups.

Example:

```text
BSc Information Technology

                     2022    2023    2024

Average GPA          3.01    3.12    3.19
Pass Rate             82%     85%     87%
Attendance            76%     79%     81%
Withdrawal             7%      5%      4%
```

Analytics can be filtered by:

* Program
* Department
* Semester
* Academic year
* Module

---

## 🧹 Data Quality Monitoring

Since reliable analytics depend on reliable data, UniPulse includes data-quality monitoring.

The system can identify:

* Missing values
* Duplicate records
* Invalid assessment values
* Invalid attendance records
* Incorrect data types
* Invalid relationships
* Unexpected outliers

This allows administrators to monitor the quality of the academic data used for analytics.

---

# 📊 Business Intelligence

In addition to analytics integrated into the web application, UniPulse includes a separate **Microsoft Power BI** environment for institutional reporting.

Planned dashboards include:

### University Overview

* Total students
* Average GPA
* Pass rate
* Attendance rate
* Module completion
* Academic attention statistics
* Semester trends

### Academic Performance

* Grade distributions
* GPA trends
* Program comparisons
* Department comparisons
* Module comparisons
* Pass/fail rates

### Engagement

* Attendance trends
* Submission completion
* Learning engagement
* Attendance vs academic performance
* Engagement by module

### Student Support

* Students by attention category
* Intervention counts
* Intervention outcomes
* Follow-up status
* Support trends

### Module Intelligence

* Comparatively difficult modules
* Difficult assessments
* Topic-level performance
* Failure rates
* Repeat rates
* Module comparisons

---

# 🔄 Data Analytics & ETL

UniPulse uses a Python-based ETL pipeline to transform operational academic data into analytical data.

```text
PostgreSQL
     │
     ▼
   Extract
     │
     ▼
   Pandas
     │
     ├── Handle missing data
     ├── Remove duplicates
     ├── Validate ranges
     ├── Standardize categories
     └── Calculate derived fields
     │
     ▼
 Transform
     │
     ▼
Analytics Tables
     │
     ├──────────► Web Analytics
     │
     └──────────► Power BI
```

The analytics environment supports:

* Data cleaning
* Exploratory Data Analysis
* Statistical analysis
* KPI calculation
* Trend analysis
* Cohort analysis
* Attendance analysis
* Academic performance analysis

---

# 🗄️ Data Management

Most academic information in UniPulse is stored using a relational **PostgreSQL** database.

Core data areas include:

```text
Users
Students
Lecturers
Advisors
Faculties
Departments
Programs
Modules
Semesters
Enrollments
Assessments
Assessment Results
Attendance Sessions
Attendance Records
Academic Interventions
Academic Indicators
Analytics Data
```

For flexible and semi-structured learning activity data, PostgreSQL **JSONB** can be used.

Example:

```json
{
  "event": "resource_view",
  "resource": "lecture_04.pdf",
  "duration": 325,
  "device": "mobile"
}
```

This allows UniPulse to demonstrate both relational and semi-structured data management.

---

# 📐 Analytics Data Model

An analytical star schema can be used for reporting and Business Intelligence.

```text
                   dim_student
                        │
                        │
dim_module ───── fact_performance ───── dim_date
                        │
                        │
                   dim_semester
                        │
                        │
                    dim_program
```

Possible measurements include:

* Assessment score
* Attendance rate
* Submission rate
* Engagement score
* Final grade
* Academic Health Score

---

# 🧪 Synthetic Academic Dataset

Since access to real private university data may not be available, UniPulse primarily uses **synthetic academic data**.

The planned dataset may contain approximately:

```text
5,000 Students
4 Faculties
8 Departments
10 Programs
80 Modules
10 Semesters
400,000 Attendance Records
150,000 Assessment Records
200,000 Learning Events
```

Synthetic data can include realistic data-quality problems such as:

* Missing values
* Duplicate records
* Outliers
* Different attendance patterns
* Different performance levels
* Different module difficulty levels
* Different engagement levels

This creates realistic scenarios for data cleaning, ETL, analytics, and dashboard development.

---

# 🔐 Privacy & Explainability

Academic information is sensitive, so UniPulse follows controlled access principles.

* Students can only access their own academic information.
* Lecturers can access students associated with their modules.
* Advisors can access assigned students.
* Administrators receive appropriate controlled privileges.
* Academic attention indicators explain the factors behind their results.
* Predictive analytics are used as decision-support tools rather than automated decision-makers.

UniPulse focuses on providing **supportive and explainable academic insights** rather than automatically making decisions about students.

---

# 🤖 Predictive Analytics Extension

After implementing the explainable rule-based Academic Attention Indicator, UniPulse may experimentally compare machine-learning approaches.

Possible algorithms include:

* Logistic Regression
* Decision Tree
* Random Forest

Possible prediction targets include:

```text
PASS / FAIL
```

or:

```text
LOW / MEDIUM / HIGH RISK
```

Possible input features include:

* Attendance rate
* Previous GPA
* Current assessment average
* Submission rate
* Number of missed assessments
* Recent performance trend
* Learning engagement

Possible evaluation metrics include:

* Accuracy
* Precision
* Recall
* F1 Score
* Confusion Matrix
* ROC-AUC

Machine-learning models are treated as **decision-support tools**, not automated academic decision-makers.

---

# 🏗️ System Architecture

```text
                 UNIPULSE USERS
       Student | Lecturer | Advisor | Admin
                         │
                         ▼
                Next.js Frontend
               React + TypeScript
                         │
                      REST API
                         │
                         ▼
               Spring Boot Backend
                         │
          ┌──────────────┼──────────────┐
          │              │              │
       Security       Services      Validation
          │              │              │
          └──────────────┼──────────────┘
                         │
                  Spring Data JPA
                         │
                         ▼
                    PostgreSQL
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
       Application Data         Python ETL
                                      │
                                      ▼
                               Analytics Schema
                                      │
                           ┌──────────┴──────────┐
                           │                     │
                           ▼                     ▼
                  React Analytics           Power BI
                           │
                           ▼
                     Academic Insights
```

---

# 🛠️ Technology Stack

### Frontend

* React
* Next.js
* TypeScript
* Tailwind CSS
* Recharts
* Axios / Fetch API

### Backend

* Java
* Spring Boot
* Spring Web
* Spring Security
* Spring Validation
* Spring Data JPA
* Hibernate
* JWT Authentication

### Database

* PostgreSQL
* PostgreSQL JSONB
* Flyway

### Data Analytics

* Python
* Pandas
* NumPy
* Matplotlib
* Jupyter Notebook
* Scikit-learn

### Business Intelligence

* Microsoft Power BI

### Testing

* JUnit
* Mockito
* Spring Boot Test
* Testcontainers
* Postman
* Pytest

### DevOps

* Git
* GitHub
* Docker
* Docker Compose
* GitHub Actions

---

# 💡 What Makes UniPulse Different?

UniPulse is not designed to be only another **Student Management System**.

Its main innovation comes from combining academic management and analytics into one platform.

Key distinguishing features include:

1. **Academic Progress Twin** – A continuously updated representation of student academic progress.
2. **What-If Grade Simulator** – Calculates the marks required to achieve a target grade.
3. **GPA Goal Planner** – Helps students explore academic scenarios for reaching a target GPA.
4. **Academic Health Score** – Provides a simple and explainable view of overall academic progress.
5. **Academic Attention Indicator** – Identifies patterns that may indicate additional academic support is useful.
6. **Assessment Difficulty Analyzer** – Identifies comparatively challenging assessments and topics.
7. **Module Difficulty Analysis** – Analyzes academic patterns across modules.
8. **Academic Intervention Management** – Connects identified academic concerns with student-support activities.
9. **Intervention Outcome Analytics** – Analyzes observed outcomes following academic support.
10. **Dual Analytics Environment** – Provides operational analytics through the web application and institutional analytics through Power BI.

---

# 🌟 Project Vision

UniPulse aims to transform university academic records into useful and actionable information.

Instead of functioning only as a system for storing student records, UniPulse is designed as a:

> **Student Success and Academic Intelligence Platform that transforms university academic data into meaningful insights for students, lecturers, academic advisors, and university management.**

The project combines:

**Full-Stack Software Engineering + Academic Management + Data Analytics + Business Intelligence + Decision Support**
