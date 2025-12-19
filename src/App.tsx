import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { RefreshCw, X, Save, Calendar, Hash, DollarSign, ArrowRight } from 'lucide-react';
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
    const { error } = await supabase
      .from('loads')
      .update({
        rate_amount: editingLoad.rate_amount,
        load_reference: editingLoad.load_reference,
        commodity: editingLoad.commodity
      })
      .eq('id', editingLoad.id);

    if (error) alert("Failed: " + error.message);
    else {
      setLoads(loads.map(l => l.id === editingLoad.id ? editingLoad : l));
      setEditingLoad(null);
    }
  };

  useEffect(() => { fetchLoads(); }, []);

  // Helper to format dates nicely (e.g., "Oct 24")
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="app-container">
      
      {/* HEADER */}
      <header className="header">
        <div className="logo-area">
          <h1>KistLogic</h1>
          <span className="badge-beta">BETA</span>
        </div>
        <button onClick={fetchLoads} className="btn-refresh">
          <RefreshCw size={18} />
        </button>
      </header>

      {/* HERO STATS */}
      <div className="stats-container">
        <div className="stat-card revenue">
          <span className="stat-label">Pending Revenue</span>
          <div className="stat-value">
            <DollarSign size={24} strokeWidth={3} />
            {loads.reduce((acc, curr) => acc + (curr.rate_amount || 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="stat-card count">
          <span className="stat-label">Active Loads</span>
          <div className="stat-value">{loads.length}</div>
        </div>
      </div>

      {/* LOAD FEED */}
      <div className="feed-label">Recent Activity</div>
      
      <div className="load-list">
        {loading ? <div className="loading-state">Syncing with AI...</div> : loads.length === 0 ? (
          <div className="empty-state">No loads found. Forward a RateCon to start.</div>
        ) : (
          loads.map((load) => (
            <div key={load.id} className="load-card" onClick={() => setEditingLoad(load)}>
              
              {/* Card Header: Ref # and Rate */}
              <div className="card-top">
                <div className="ref-badge">
                  <Hash size={12} /> {load.load_reference}
                </div>
                <div className="rate-badge">${load.rate_amount}</div>
              </div>

              {/* Route Section */}
              <div className="route-container">
                <div className="stop">
                  <span className="stop-label">PICKUP</span>
                  <span className="city">{load.raw_data?.stops?.[0]?.city || 'Unknown'}</span>
                  <span className="state">{load.raw_data?.stops?.[0]?.state}</span>
                  <div className="date-pill"><Calendar size={10} /> {formatDate(load.raw_data?.stops?.[0]?.date)}</div>
                </div>
                
                <div className="route-arrow">
                  <ArrowRight size={20} color="#cbd5e1" />
                </div>

                <div className="stop right">
                  <span className="stop-label">DROP</span>
                  <span className="city">{load.raw_data?.stops?.[load.raw_data.stops?.length - 1]?.city || 'Unknown'}</span>
                  <span className="state">{load.raw_data?.stops?.[load.raw_data.stops?.length - 1]?.state}</span>
                   <div className="date-pill"><Calendar size={10} /> {formatDate(load.raw_data?.stops?.[load.raw_data.stops?.length - 1]?.date)}</div>
                </div>
              </div>

              {/* Footer: Commodity & Status */}
              <div className="card-footer">
                <span className="commodity">{load.commodity || 'General Freight'}</span>
                <span className={`status-dot ${load.status === 'PUSHED_TO_TMS' ? 'success' : 'pending'}`}>
                  {load.status === 'PUSHED_TO_TMS' ? 'Synced to TMS' : 'Processing'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* EDIT MODAL */}
      {editingLoad && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Load Details</h2>
              <button onClick={() => setEditingLoad(null)} className="close-btn"><X /></button>
            </div>
            
            <div className="input-group">
              <label>Reference Number</label>
              <input value={editingLoad.load_reference} onChange={e => setEditingLoad({...editingLoad, load_reference: e.target.value})} />
            </div>

            <div className="input-group">
              <label>Rate ($)</label>
              <input type="number" value={editingLoad.rate_amount} onChange={e => setEditingLoad({...editingLoad, rate_amount: parseFloat(e.target.value)})} />
            </div>

            <div className="input-group">
              <label>Commodity</label>
              <input value={editingLoad.commodity} onChange={e => setEditingLoad({...editingLoad, commodity: e.target.value})} />
            </div>

            <button onClick={handleUpdate} className="save-btn"><Save size={18} /> Update Load</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;