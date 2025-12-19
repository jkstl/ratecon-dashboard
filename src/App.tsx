import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Truck, DollarSign, MapPin, RefreshCw, X, Save } from 'lucide-react';
import './App.css';

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
  const [editingLoad, setEditingLoad] = useState<Load | null>(null);

  const fetchLoads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('loads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching loads:', error);
    else setLoads(data || []);
    setLoading(false);
  };

  const handleUpdate = async () => {
    if (!editingLoad) return;
    
    // 1. Update Supabase
    const { error } = await supabase
      .from('loads')
      .update({
        rate_amount: editingLoad.rate_amount,
        load_reference: editingLoad.load_reference,
        commodity: editingLoad.commodity
      })
      .eq('id', editingLoad.id);

    if (error) {
      alert("Failed to update: " + error.message);
    } else {
      // 2. Refresh Local State
      setLoads(loads.map(l => l.id === editingLoad.id ? editingLoad : l));
      setEditingLoad(null); // Close modal
    }
  };

  useEffect(() => {
    fetchLoads();
  }, []);

  return (
    <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f9', minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1a1a1a' }}>RateCon Dashboard</h1>
        <button onClick={fetchLoads} style={btnStyle}>
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <Card title="Loads" value={loads.length} icon={<Truck size={20}/>} />
        <Card title="Revenue" value={`$${loads.reduce((acc, curr) => acc + (curr.rate_amount || 0), 0)}`} icon={<DollarSign size={20}/>} />
      </div>

      {/* Load List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? <p>Loading...</p> : loads.map((load) => (
          <div 
            key={load.id} 
            onClick={() => setEditingLoad(load)}
            style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{load.load_reference}</span>
              <span style={{ fontWeight: 'bold', color: '#16a34a' }}>${load.rate_amount}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '0.9rem' }}>
              <MapPin size={14}/>
              {load.raw_data?.stops?.[0]?.city} ➝ {load.raw_data?.stops?.[load.raw_data.stops?.length - 1]?.city}
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editingLoad && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Edit Load</h2>
              <button onClick={() => setEditingLoad(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>

            <label style={labelStyle}>Load Ref #</label>
            <input 
              style={inputStyle} 
              value={editingLoad.load_reference} 
              onChange={e => setEditingLoad({...editingLoad, load_reference: e.target.value})}
            />

            <label style={labelStyle}>Rate Amount ($)</label>
            <input 
              style={inputStyle} 
              type="number" 
              value={editingLoad.rate_amount} 
              onChange={e => setEditingLoad({...editingLoad, rate_amount: parseFloat(e.target.value)})}
            />

            <label style={labelStyle}>Commodity</label>
            <input 
              style={inputStyle} 
              value={editingLoad.commodity} 
              onChange={e => setEditingLoad({...editingLoad, commodity: e.target.value})}
            />

            <button onClick={handleUpdate} style={{ ...btnStyle, width: '100%', justifyContent: 'center', marginTop: '1rem', backgroundColor: '#16a34a' }}>
              <Save size={18} /> Save Changes
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// Styles
const btnStyle = { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const inputStyle = { width: '100%', padding: '10px', marginBottom: '1rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '16px' };
const labelStyle = { display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', color: '#475569' };

function Card({ title, value, icon }: any) {
  return (
    <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ color: '#2563eb' }}>{icon}</div>
      <div>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{title}</p>
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>{value}</h3>
      </div>
    </div>
  );
}

export default App;