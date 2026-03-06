# GlucoTrax - Patient Tracking Platform

A comprehensive Progressive Web App for tracking therapy patients, providing data collection, monitoring, and analytics for patients, doctors, and administrators.

## Features

### For Patients
- **Dashboard**: Track weight progress, medication doses, points, and goals
- **Data Entry**: Multi-step form to log therapy details, weight, vitals, side effects, and adherence
- **History**: View complete therapy journey with weight trends and medication history
- **Gamification**: Earn points for weekly updates and milestones
- **Smart Alerts**: Automatic safety alerts for severe side effects

### For Doctors
- **Patient Management**: View all linked patients
- **Patient Monitoring**: Track individual patient progress, weight trends, and therapy details
- **Alert System**: Receive notifications for patients with severe side effects or concerning patterns
- **Clinical Tools**: Monitor adherence, side effects, and outcomes

### For Administrators
- **System Analytics**: View total patients, doctors, entries, and active alerts
- **Alert Management**: Monitor and resolve system-wide alerts
- **Patient Overview**: Access complete patient database with filtering capabilities
- **Trend Reports**: Analyze therapy success rates and outcomes

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Routing**: React Router

## Database Schema

The application includes 13 tables with comprehensive Row Level Security (RLS):

- `profiles` - User accounts and roles
- `patients` - Patient baseline information
- `doctors` - Doctor profiles with unique DC codes
- `therapy_entries` - Medication and dosage tracking
- `weight_vitals` - Weight and vital signs
- `side_effects` - Symptom reporting with severity levels
- `adherence_tracking` - Missed doses and appetite changes
- `weekly_entries` - Complete weekly submissions
- `points_transactions` - Gamification point tracking
- `rewards` - Available rewards catalog
- `patient_rewards` - Redeemed rewards
- `alerts` - Safety monitoring alerts
- `doctor_notes` - Clinical notes

## User Roles

### Patient
- Submit weekly health data
- Track weight and therapy progress
- Report side effects
- Earn and redeem points
- View personal history

### Doctor
- View assigned patients via DC code
- Monitor patient progress
- Review alerts and side effects
- Track adherence and outcomes

### Admin
- System-wide analytics
- Alert management
- Patient and doctor oversight
- Data export capabilities

## Key Workflows

### Patient Registration
1. Create account with email/password
2. Select role (Patient/Doctor/Admin)
3. For patients: Complete baseline profile (name, age, gender, height, weight, diabetes status)
4. Optional: Link to doctor using DC code

### Weekly Data Entry
1. **Therapy Details**: Medication, dose, injection date, weeks on therapy
2. **Weight & Vitals**: Current weight, optional blood glucose, BP, HbA1C
3. **Side Effects**: Select symptoms with severity levels, receive contextual feedback
4. **Adherence**: Report missed doses, appetite changes, cravings
5. **Review & Submit**: Confirm all data before submission

### Points System
- Weekly update: +10 points
- Full month completion: +40 points
- 5% weight loss milestone: +50 bonus points

### Doctor-Patient Linking
- Doctors receive unique DC codes
- Patients enter DC code during registration
- Automatic linking for patient monitoring

## Security

- Row Level Security (RLS) on all tables
- Patients can only access their own data
- Doctors can only access assigned patients
- Admins have full system access
- Secure authentication with Supabase Auth

## Development

The application is ready for deployment with:
- Production build optimized
- PWA-ready architecture
- Responsive mobile-first design
- Offline-capable data entry
- Real-time data synchronization

## Design Principles

- Clean, modern interface with emerald/teal color scheme
- Mobile-first responsive design
- Intuitive navigation and workflows
- Contextual help and feedback
- Accessibility-focused components
- Premium feel with attention to detail

## Future Enhancements

- Push notifications for missed entries
- PDF report generation
- Advanced analytics and insights
- AI-powered side effect interpretation
- Behavioral adherence scoring
- EHR integration
- Multi-language support
