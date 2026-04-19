'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './bills.module.css';

const AVAILABLE_SERVICES = [
  { name: 'front_office', display: 'Front Office' },
  { name: 'housekeeping', display: 'Housekeeping' },
  { name: 'fnb_outlets', display: 'F&B Outlets' },
  { name: 'kitchen', display: 'Kitchen' },
  { name: 'facilities', display: 'Facilities' },
  { name: 'special_assistance', display: 'Special Assistance' },
  { name: 'banquet_events', display: 'Banquet/Events' },
  { name: 'pool_gym', display: 'Pool/Gym' },
];

export default function BillsPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ bill_number: '', customer_name: '', room_number: '', services: [] });
  const router = useRouter();

  useEffect(() => {
    if (!sessionStorage.getItem('admin_token')) { router.push('/admin/login'); return; }
    loadBills();
  }, []);

  const loadBills = () => {
    fetch('/api/admin/bills')
      .then(r => r.json())
      .then(data => { setBills(data.bills || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const toggleService = (name) => {
    setForm(prev => ({
      ...prev,
      services: prev.services.includes(name) ? prev.services.filter(s => s !== name) : [...prev.services, name],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ bill_number: '', customer_name: '', room_number: '', services: [] });
        loadBills();
      }
    } catch {} finally { setSaving(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Bills</h1>
          <p>Manage guest bills and service assignments</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Bill'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.formCard}>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Bill Number</label>
              <input type="text" placeholder="BILL-2026-XXX" value={form.bill_number} onChange={e => setForm(p => ({ ...p, bill_number: e.target.value }))} required />
            </div>
            <div className={styles.field}>
              <label>Customer Name</label>
              <input type="text" placeholder="Guest name" value={form.customer_name} onChange={e => setForm(p => ({ ...p, customer_name: e.target.value }))} required />
            </div>
            <div className={styles.field}>
              <label>Room Number</label>
              <input type="text" placeholder="Optional" value={form.room_number} onChange={e => setForm(p => ({ ...p, room_number: e.target.value }))} />
            </div>
          </div>
          <div className={styles.field}>
            <label>Services Used</label>
            <div className={styles.serviceChips}>
              {AVAILABLE_SERVICES.map(svc => (
                <button key={svc.name} type="button"
                  className={`${styles.svcChip} ${form.services.includes(svc.name) ? styles.svcActive : ''}`}
                  onClick={() => toggleService(svc.name)}>
                  {svc.display}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className={styles.saveBtn} disabled={saving || !form.bill_number || !form.customer_name || form.services.length === 0}>
            {saving ? 'Saving...' : 'Create Bill'}
          </button>
        </form>
      )}

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingList}>{[...Array(4)].map((_, i) => <div key={i} className={styles.skeleton} />)}</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Bill Number</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Services</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bills.map(bill => (
                <tr key={bill.id}>
                  <td><code className={styles.code}>{bill.bill_number}</code></td>
                  <td>{bill.customer_name}</td>
                  <td>{bill.room_number || '—'}</td>
                  <td>
                    <div className={styles.svcTags}>
                      {(bill.bill_services || []).map((bs, i) => (
                        <span key={i} className={styles.svcTag}>{bs.services?.display_name || bs.service_name}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.status} ${bill.is_feedback_submitted ? styles.statusDone : styles.statusPending}`}>
                      {bill.is_feedback_submitted ? 'Submitted' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && bills.length === 0 && <div className={styles.empty}>No bills found</div>}
      </div>
    </div>
  );
}
