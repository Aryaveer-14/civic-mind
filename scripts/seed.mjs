const BASE = 'http://127.0.0.1:5000';

async function main(){
  const email = `seed-${Date.now()}@civic.local`;
  const body = { email, name: 'Seed User', contact_number: '+1555000' + Math.floor(1000+Math.random()*8999), age: 30, locality: 'Downtown' };
  const reg = await fetch(BASE + '/register', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
  const regData = await reg.json();
  if(!reg.ok){
    console.error('Register failed', reg.status, regData);
    process.exit(1);
  }
  const otp = regData.otp; const phone = regData.contact_number;
  const ver = await fetch(BASE + '/verify-otp', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({contact_number: phone, otp})});
  const verData = await ver.json();
  if(!ver.ok){
    console.error('Verify failed', ver.status, verData);
    process.exit(1);
  }
  const userId = verData.user_id;
  // Upsert a sample authority so analysis can return exact contacts
  const authUpsert = await fetch(BASE + '/authorities/upsert', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Municipal Public Works Department',
      department: 'City Public Works',
      phone: '+1-555-123-4567',
      email: 'publicworks@example.gov',
      website: 'https://example.gov/publicworks',
      address: '123 Civic Center Rd',
      office_hours: 'Mon-Fri 9am-5pm',
      area: '',
      aliases: ['Public Works', 'Roads Department']
    })
  });
  if (!authUpsert.ok) {
    const d = await authUpsert.json().catch(()=>({}));
    console.error('Authority upsert failed', authUpsert.status, d);
  }
  const fd = new FormData();
  fd.append('text','There is a pothole near 5th and Main.');
  fd.append('user_id', userId);
  const an = await fetch(BASE + '/analyze', { method:'POST', body: fd });
  const anData = await an.json();
  if(!an.ok){
    console.error('Analyze failed', an.status, anData);
    process.exit(1);
  }
  const complaintId = anData.complaint_id;
  const fb = await fetch(BASE + '/feedback', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ complaint_id: complaintId, satisfied: true })});
  const fbData = await fb.json();
  if(!fb.ok){
    console.error('Feedback failed', fb.status, fbData);
    process.exit(1);
  }
  const stats = await fetch(BASE + '/stats');
  const statsData = await stats.json();
  console.log('Seed complete. User:', email);
  console.log('Stats:', JSON.stringify(statsData));
}

main().catch(e=>{ console.error(e); process.exit(1); });
