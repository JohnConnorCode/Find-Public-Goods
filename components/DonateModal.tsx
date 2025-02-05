// components/DonateModal.tsx
import React, { useState } from 'react';
import axios from 'axios';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string; // project id to link the donation
}

const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose, projectId }) => {
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDonate = async () => {
    setError('');
    setSuccess('');
    if (amount <= 0) {
      setError('Please enter a valid donation amount.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await axios.post('/api/donate', {
        project_id: projectId,
        amount,
        payment_method: 'crypto' // for now, this is hardcoded; expand later as needed
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Thank you for your donation!');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An unexpected error occurred.');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-4">Donate</h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}
        <div className="mb-4">
          <label className="block font-medium mb-1">Donation Amount</label>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full p-2 border rounded"
            placeholder="Enter amount"
          />
        </div>
        <button
          onClick={handleDonate}
          disabled={loading}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition"
        >
          {loading ? 'Processing...' : 'Donate'}
        </button>
        <button
          onClick={onClose}
          className="mt-4 w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-100 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DonateModal;
