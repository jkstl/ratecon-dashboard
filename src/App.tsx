import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Truck, DollarSign, Calendar, MapPin, RefreshCw } from 'lucide-react';
import './App.css'; // Standard Vite CSS

interface Load {
  id: string;
  created_at: string;
  load_reference: string;
  rate_amount: number;
  commodity: string;
  status: string;
  raw_data: any;
}

function App() {
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoads = async () => {
    setLoading(true);
    // Fetch all loads (ordered by newest)
    const { data, error } = await supabase
      .from('loads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching loads:', error);
    else setLoads(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLoads();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f9', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, color: '#1a1a1a' }}>RateCon Dashboard</h1>
          <p style={{ margin: 0, color: '#666' }}>Live Feed from Email Gateway</p>
        </div>
        <button 
          onClick={fetchLoads}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <Card title="Total Loads" value={loads.length} icon={<Truck />} />
        <Card title="Revenue Pending" value={`$${loads.reduce((acc, curr) => acc + (curr.rate_amount || 0), 0)}`} icon={<DollarSign />} />
      </div>

      {/* The Load Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Load Ref #</th>
              <th style={{ padding: '1rem' }}>Commodity</th>
              <th style={{ padding: '1rem' }}>Route</th>
              <th style={{ padding: '1rem' }}>Rate</th>
              <th style={{ padding: '1rem' }}>Received</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>Loading feed...</td></tr>
            ) : loads.map((load) => (
              <tr key={load.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                    backgroundColor: load.status === 'PUSHED_TO_TMS' ? '#dcfce7' : '#fee2e2',
                    color: load.status === 'PUSHED_TO_TMS' ? '#166534' : '#991b1b'
                  }}>
                    {load.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{load.load_reference}</td>
                <td style={{ padding: '1rem' }}>{load.commodity}</td>
                <td style={{ padding: '1rem', fontSize: '14px', color: '#64748b' }}>
                  {/* Extract cities from raw_data if available */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin size={14}/>
                    {load.raw_data?.stops?.[0]?.city}, {load.raw_data?.stops?.[0]?.state} 
                    {' ➝ '}
                    {load.raw_data?.stops?.[load.raw_data.stops.length - 1]?.city}, {load.raw_data?.stops?.[load.raw_data.stops.length - 1]?.state}
                  </div>
                </td>
                <td style={{ padding: '1rem', fontWeight: 'bold', color: '#16a34a' }}>${load.rate_amount}</td>
                <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={14}/>
                    {new Date(load.created_at).toLocaleDateString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Simple Helper Component
function Card({ title, value, icon }: any) {
  return (
    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ padding: '10px', backgroundColor: '#eff6ff', borderRadius: '50%', color: '#2563eb' }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>{title}</p>
        <h3 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>{value}</h3>
      </div>
    </div>
  );
}

export default App;