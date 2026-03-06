import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const doctors = [
      { email: 'd1@dr.com', password: '123456', name: 'Dr. Rajesh Kumar', specialization: 'Endocrinology', hospital: 'Apollo Hospital Mumbai', doctor_id: 'Doc01' },
      { email: 'd2@dr.com', password: '123456', name: 'Dr. Priya Sharma', specialization: 'Endocrinology', hospital: 'Fortis Hospital Delhi', doctor_id: 'Doc02' },
      { email: 'd3@dr.com', password: '123456', name: 'Dr. Amit Patel', specialization: 'Diabetology', hospital: 'Medanta Hospital Bangalore', doctor_id: 'Doc03' },
      { email: 'd4@dr.com', password: '123456', name: 'Dr. Sunita Reddy', specialization: 'Internal Medicine', hospital: 'Care Hospital Hyderabad', doctor_id: 'Doc04' },
      { email: 'd5@dr.com', password: '123456', name: 'Dr. Arjun Singh', specialization: 'Endocrinology', hospital: 'Max Hospital Kolkata', doctor_id: 'Doc05' },
      { email: 'd6@dr.com', password: '123456', name: 'Dr. Meera Iyer', specialization: 'Diabetology', hospital: 'AIIMS Chennai', doctor_id: 'Doc06' },
    ];

    const patients = [
      { email: 'p1@p.com', password: '123456', name: 'Rahul Verma', age: 42, gender: 'Male', medication: 'Semaglutide', start_date: '2024-01-15', doctor_id: 'Doc01', state: 'Maharashtra', city: 'Mumbai', has_diabetes: true, starting_weight: 95, goal_weight: 80, height: 175 },
      { email: 'p2@p.com', password: '123456', name: 'Anita Desai', age: 38, gender: 'Female', medication: 'Liraglutide', start_date: '2024-02-01', doctor_id: 'Doc01', state: 'Delhi', city: 'New Delhi', has_diabetes: false, starting_weight: 82, goal_weight: 70, height: 162 },
      { email: 'p3@p.com', password: '123456', name: 'Vikram Malhotra', age: 55, gender: 'Male', medication: 'Ozempic', start_date: '2023-11-20', doctor_id: 'Doc02', state: 'Karnataka', city: 'Bangalore', has_diabetes: true, starting_weight: 105, goal_weight: 88, height: 180 },
      { email: 'p4@p.com', password: '123456', name: 'Deepa Nair', age: 45, gender: 'Female', medication: 'Wegovy', start_date: '2024-01-10', doctor_id: 'Doc03', state: 'Kerala', city: 'Kochi', has_diabetes: false, starting_weight: 88, goal_weight: 72, height: 165 },
      { email: 'p5@p.com', password: '123456', name: 'Sanjay Gupta', age: 50, gender: 'Male', medication: 'Semaglutide', start_date: '2023-12-05', doctor_id: 'Doc03', state: 'Uttar Pradesh', city: 'Lucknow', has_diabetes: true, starting_weight: 98, goal_weight: 82, height: 172 },
      { email: 'p6@p.com', password: '123456', name: 'Kavita Joshi', age: 35, gender: 'Female', medication: 'Liraglutide', start_date: '2024-02-20', doctor_id: 'Doc04', state: 'Telangana', city: 'Hyderabad', has_diabetes: false, starting_weight: 78, goal_weight: 65, height: 158 },
      { email: 'p7@p.com', password: '123456', name: 'Arjun Rao', age: 48, gender: 'Male', medication: 'Ozempic', start_date: '2024-01-25', doctor_id: 'Doc05', state: 'West Bengal', city: 'Kolkata', has_diabetes: true, starting_weight: 92, goal_weight: 78, height: 170 },
      { email: 'p8@p.com', password: '123456', name: 'Priya Menon', age: 40, gender: 'Female', medication: 'Wegovy', start_date: '2023-12-15', doctor_id: 'Doc05', state: 'Tamil Nadu', city: 'Chennai', has_diabetes: false, starting_weight: 85, goal_weight: 70, height: 160 },
      { email: 'p9@p.com', password: '123456', name: 'Karan Kapoor', age: 52, gender: 'Male', medication: 'Semaglutide', start_date: '2024-02-10', doctor_id: 'Doc06', state: 'Punjab', city: 'Chandigarh', has_diabetes: true, starting_weight: 100, goal_weight: 85, height: 178 },
      { email: 'p10@p.com', password: '123456', name: 'Neha Agarwal', age: 33, gender: 'Female', medication: 'Liraglutide', start_date: '2024-01-05', doctor_id: 'Doc06', state: 'Gujarat', city: 'Ahmedabad', has_diabetes: false, starting_weight: 75, goal_weight: 62, height: 155 },
      { email: 'p11@p.com', password: '123456', name: 'Manoj Kumar', age: 44, gender: 'Male', medication: 'Semaglutide', start_date: '2024-01-20', doctor_id: 'Doc01', state: 'Maharashtra', city: 'Pune', has_diabetes: true, starting_weight: 102, goal_weight: 87, height: 176 },
      { email: 'p12@p.com', password: '123456', name: 'Lakshmi Iyer', age: 37, gender: 'Female', medication: 'Ozempic', start_date: '2023-12-10', doctor_id: 'Doc02', state: 'Karnataka', city: 'Mysore', has_diabetes: false, starting_weight: 80, goal_weight: 68, height: 163 },
      { email: 'p13@p.com', password: '123456', name: 'Rajesh Singh', age: 49, gender: 'Male', medication: 'Wegovy', start_date: '2024-02-05', doctor_id: 'Doc03', state: 'Rajasthan', city: 'Jaipur', has_diabetes: true, starting_weight: 96, goal_weight: 80, height: 174 },
      { email: 'p14@p.com', password: '123456', name: 'Shalini Reddy', age: 41, gender: 'Female', medication: 'Liraglutide', start_date: '2024-01-18', doctor_id: 'Doc04', state: 'Telangana', city: 'Warangal', has_diabetes: false, starting_weight: 87, goal_weight: 73, height: 166 },
      { email: 'p15@p.com', password: '123456', name: 'Amit Sharma', age: 36, gender: 'Male', medication: 'Semaglutide', start_date: '2023-11-25', doctor_id: 'Doc01', state: 'Delhi', city: 'Gurgaon', has_diabetes: true, starting_weight: 94, goal_weight: 79, height: 171 },
      { email: 'p16@p.com', password: '123456', name: 'Pooja Mehta', age: 39, gender: 'Female', medication: 'Ozempic', start_date: '2024-02-12', doctor_id: 'Doc02', state: 'Gujarat', city: 'Surat', has_diabetes: false, starting_weight: 83, goal_weight: 70, height: 161 },
      { email: 'p17@p.com', password: '123456', name: 'Arun Bose', age: 53, gender: 'Male', medication: 'Wegovy', start_date: '2024-01-08', doctor_id: 'Doc05', state: 'West Bengal', city: 'Durgapur', has_diabetes: true, starting_weight: 108, goal_weight: 91, height: 182 },
      { email: 'p18@p.com', password: '123456', name: 'Divya Nambiar', age: 34, gender: 'Female', medication: 'Liraglutide', start_date: '2023-12-20', doctor_id: 'Doc06', state: 'Kerala', city: 'Trivandrum', has_diabetes: false, starting_weight: 76, goal_weight: 64, height: 159 },
      { email: 'p19@p.com', password: '123456', name: 'Suresh Patel', age: 47, gender: 'Male', medication: 'Semaglutide', start_date: '2024-02-15', doctor_id: 'Doc03', state: 'Madhya Pradesh', city: 'Indore', has_diabetes: true, starting_weight: 99, goal_weight: 84, height: 173 },
      { email: 'p20@p.com', password: '123456', name: 'Rekha Pillai', age: 43, gender: 'Female', medication: 'Ozempic', start_date: '2024-01-12', doctor_id: 'Doc04', state: 'Tamil Nadu', city: 'Coimbatore', has_diabetes: false, starting_weight: 86, goal_weight: 72, height: 164 },
    ];

    const results = { doctors: [], patients: [], admin: null };

    const { data: adminAuth, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@gmail.com',
      password: '123456',
      email_confirm: true,
      user_metadata: { name: 'System Administrator', role: 'admin' }
    });

    if (adminError && !adminError.message.includes('already')) {
      console.error('Error creating admin:', adminError);
    } else {
      results.admin = 'admin@gmail.com';
    }

    for (const doctor of doctors) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: doctor.email,
        password: doctor.password,
        email_confirm: true,
        user_metadata: { name: doctor.name, role: 'doctor' }
      });

      if (authError && !authError.message.includes('already')) {
        console.error(`Error creating doctor ${doctor.email}:`, authError);
        continue;
      }

      if (authData?.user) {
        const { error: doctorError } = await supabase
          .from('doctors')
          .upsert({
            user_id: authData.user.id,
            name: doctor.name,
            specialization: doctor.specialization,
            hospital: doctor.hospital,
            doctor_id: doctor.doctor_id
          }, { onConflict: 'user_id' });

        if (doctorError) {
          console.error(`Error inserting doctor data:`, doctorError);
        } else {
          results.doctors.push(doctor.email);
        }
      }
    }

    for (const patient of patients) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: patient.email,
        password: patient.password,
        email_confirm: true,
        user_metadata: { name: patient.name, role: 'patient' }
      });

      if (authError && !authError.message.includes('already')) {
        console.error(`Error creating patient ${patient.email}:`, authError);
        continue;
      }

      if (authData?.user) {
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .upsert({
            user_id: authData.user.id,
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            medication: patient.medication,
            start_date: patient.start_date,
            doctor_id: patient.doctor_id,
            state: patient.state,
            city: patient.city,
            has_diabetes: patient.has_diabetes,
            starting_weight: patient.starting_weight,
            goal_weight: patient.goal_weight,
            height: patient.height,
            total_points: Math.floor(Math.random() * 500) + 100
          }, { onConflict: 'user_id' })
          .select()
          .single();

        if (patientError) {
          console.error(`Error inserting patient data:`, patientError);
        } else {
          results.patients.push(patient.email);

          const startDate = new Date(patient.start_date);
          const today = new Date();
          const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

          const weightEntries = [];
          const medicineIntakes = [];
          const sideEffects = [];
          const exerciseActivities = [];

          let currentWeight = patient.starting_weight;
          const targetWeight = patient.goal_weight || currentWeight * 0.85;
          const heightCm = patient.height;

          for (let i = 0; i <= daysDiff && i <= 90; i += 7) {
            const entryDate = new Date(startDate);
            entryDate.setDate(entryDate.getDate() + i);

            const weightLoss = (currentWeight - targetWeight) * (i / 90) * (0.9 + Math.random() * 0.2);
            const weight = currentWeight - weightLoss;
            const bmi = weight / Math.pow(heightCm / 100, 2);

            weightEntries.push({
              user_id: authData.user.id,
              weight: Math.round(weight * 10) / 10,
              height: heightCm,
              bmi: Math.round(bmi * 10) / 10,
              waist_circumference: Math.round((90 + (currentWeight - weight) * 0.5) * 10) / 10,
              entry_date: entryDate.toISOString().split('T')[0]
            });
          }

          for (let i = 0; i <= daysDiff && i <= 90; i++) {
            const entryDate = new Date(startDate);
            entryDate.setDate(entryDate.getDate() + i);

            if (Math.random() > 0.15) {
              medicineIntakes.push({
                user_id: authData.user.id,
                medication_name: patient.medication,
                dosage: ['0.25mg', '0.5mg', '1mg'][Math.min(Math.floor(i / 30), 2)],
                taken_at: entryDate.toISOString(),
                notes: Math.random() > 0.7 ? ['Feeling good', 'No issues', 'Slight nausea'][Math.floor(Math.random() * 3)] : null
              });
            }

            if (Math.random() > 0.85) {
              const sideEffectTypes = ['Nausea', 'Fatigue', 'Headache', 'Dizziness', 'Constipation', 'Diarrhea'];
              sideEffects.push({
                user_id: authData.user.id,
                side_effect: sideEffectTypes[Math.floor(Math.random() * sideEffectTypes.length)],
                severity: ['Mild', 'Moderate', 'Severe'][Math.floor(Math.random() * 3)],
                reported_at: entryDate.toISOString(),
                notes: Math.random() > 0.5 ? 'Lasted a few hours' : null
              });
            }

            if (Math.random() > 0.6) {
              const activityTypes = ['Walking', 'Running', 'Cycling', 'Swimming', 'Yoga', 'Gym Workout'];
              exerciseActivities.push({
                user_id: authData.user.id,
                activity_type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
                duration_minutes: 20 + Math.floor(Math.random() * 60),
                calories_burned: 100 + Math.floor(Math.random() * 300),
                activity_date: entryDate.toISOString().split('T')[0],
                notes: Math.random() > 0.7 ? 'Good session' : null
              });
            }
          }

          if (weightEntries.length > 0) {
            const { error: weightError } = await supabase.from('weight_entries').insert(weightEntries);
            if (weightError) console.error('Weight entries error:', weightError);
          }

          if (medicineIntakes.length > 0) {
            const { error: medicineError } = await supabase.from('medicine_intake').insert(medicineIntakes);
            if (medicineError) console.error('Medicine intake error:', medicineError);
          }

          if (sideEffects.length > 0) {
            const { error: sideEffectsError } = await supabase.from('side_effects_user').insert(sideEffects);
            if (sideEffectsError) console.error('Side effects error:', sideEffectsError);
          }

          if (exerciseActivities.length > 0) {
            const { error: exerciseError } = await supabase.from('exercise_activities_user').insert(exerciseActivities);
            if (exerciseError) console.error('Exercise activities error:', exerciseError);
          }

          const alerts = [];
          if (Math.random() > 0.6 && patientData?.id) {
            const alertTypes = [
              { type: 'Weight Gain', severity: 'high', message: 'Patient gained 2kg in the last week. Immediate consultation recommended.' },
              { type: 'Missed Doses', severity: 'medium', message: 'Patient missed 3 doses in the last week. Follow up required.' },
              { type: 'Severe Side Effect', severity: 'high', message: 'Patient reported severe nausea. Consider dose adjustment.' },
              { type: 'No Progress', severity: 'low', message: 'No weight loss in the last 2 weeks. Review treatment plan.' },
              { type: 'High Blood Sugar', severity: 'medium', message: 'Blood glucose levels elevated. Monitor closely.' }
            ];
            const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
            alerts.push({
              patient_id: patientData.id,
              alert_type: alert.type,
              severity: alert.severity,
              message: alert.message,
              resolved: false
            });
          }

          if (alerts.length > 0) {
            const { error: alertsError } = await supabase.from('alerts').insert(alerts);
            if (alertsError) console.error('Alerts error:', alertsError);
          }

          const weeklyEntriesData = [];
          for (let i = 0; i <= daysDiff && i <= 90; i += 7) {
            const entryDate = new Date(startDate);
            entryDate.setDate(entryDate.getDate() + i);

            if (patientData?.id) {
              weeklyEntriesData.push({
                patient_id: patientData.id,
                week_number: Math.floor(i / 7) + 1,
                entry_date: entryDate.toISOString().split('T')[0],
                completed: true,
                points_awarded: 50 + Math.floor(Math.random() * 50)
              });
            }
          }

          if (weeklyEntriesData.length > 0) {
            const { error: weeklyError } = await supabase.from('weekly_entries').insert(weeklyEntriesData);
            if (weeklyError) console.error('Weekly entries error:', weeklyError);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
