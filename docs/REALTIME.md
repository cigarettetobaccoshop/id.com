# Supabase Real-time Integration

## Overview

Real-time functionality memungkinkan aplikasi untuk menerima update data secara instant ketika ada perubahan di database.

## Features

✅ Real-time subscriptions untuk INSERT, UPDATE, DELETE
✅ Multi-tab sync (data terupdate di semua tab)
✅ Broadcast messaging untuk komunikasi antar client
✅ Automatic reconnection handling
✅ Production-ready dengan error handling

## Setup

### 1. Enable Real-time di Supabase

Di Supabase Dashboard:
1. Database > Replication
2. Select table yang ingin di-enable: `todos`
3. Toggle "Enable realtime"

### 2. Usage

```javascript
import { setupRealtimeSubscription } from '@/lib/supabaseRealtimeClient'

// Subscribe ke changes
const channel = setupRealtimeSubscription(
  'todos',
  (payload) => {
    console.log('Change:', payload)
    // Handle INSERT, UPDATE, DELETE
  }
)

// Cleanup saat unmount
channel.unsubscribe()
```

### 3. Test

Development:
```bash
npm run dev
# Open http://localhost:3000/realtime-demo
# Open multiple tabs untuk test multi-tab sync
```

Production:
```bash
# Already deployed dengan real-time support
# Vercel handles automatic deployment
```

## API Endpoints

### GET /api/todos
Fetch all todos

```bash
curl http://localhost:3000/api/todos
```

### POST /api/todos
Create new todo

```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"name":"Buy groceries"}'
```

### PUT /api/todos
Update todo

```bash
curl -X PUT http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"id":1,"name":"Buy milk","completed":true}'
```

### DELETE /api/todos
Delete todo

```bash
curl -X DELETE http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"id":1}'
```

## Database Setup

Create `todos` table in Supabase:

```sql
CREATE TABLE todos (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Public access (for demo - change in production)
CREATE POLICY "Enable read access for all users"
  ON todos FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users"
  ON todos FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users"
  ON todos FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users"
  ON todos FOR DELETE USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE todos;
```

## Security

⚠️ **Important**: RLS policies di atas adalah untuk demo saja!

Production setup:
```sql
-- Restrict to authenticated users
CREATE POLICY "Enable read access for authenticated users"
  ON todos FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users"
  ON todos FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Troubleshooting

### Real-time updates tidak muncul
1. Check: Apakah table sudah enable real-time di Supabase?
2. Check: Apakah RLS policies memungkinkan akses?
3. Check browser console untuk error messages

### Connection timeout
1. Verifikasi internet connection
2. Check Supabase status: https://status.supabase.com

## Next Steps

- ✅ Step 2 Complete: Real-time Integration
- 📋 Step 3: OAuth Integration (Google & GitHub)
- 📁 Step 4: Storage Setup
- 📊 Step 5: Analytics & Optimization
