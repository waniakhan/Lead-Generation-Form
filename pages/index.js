import { useState } from 'react';

export default function Home() {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    cnic: "",
    mobile: "",
    city: "",
    income: "",
    products: "",
  });

  const [message, setMessage] = useState({ text: "", type: "" });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Failed to save lead.");

      showMessage("✅ Thanks! Your lead has been saved.", "success");

      setForm({
        name: "",
        cnic: "",
        mobile: "",
        city: "",
        income: "",
        products: "",
      });
    } catch (err) {
      console.error(err);
      showMessage("❌ Something went wrong. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-3xl shadow-xl max-w-xl w-full">
        <h1 className="text-2xl font-bold text-center mb-4">Apply Now!</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input name="name" value={form.name} onChange={onChange} placeholder="Full Name" required className="input" />
          <input name="cnic" value={form.cnic} onChange={onChange} placeholder="CNIC (13 digits)" pattern="\d{13}" required className="input" />
          <input name="mobile" value={form.mobile} onChange={onChange} placeholder="Mobile Number" pattern="^0[0-9]{10}$" required className="input" />
          <input name="city" value={form.city} onChange={onChange} placeholder="City" required className="input" />
          <input name="income" value={form.income} onChange={onChange} placeholder="Income / Month" type="number" required className="input" />
          <textarea name="products" value={form.products} onChange={onChange} placeholder="Products Interested In" rows={3} className="input"></textarea>

          <button type="submit" disabled={submitting} className="w-full py-2 bg-teal-600 text-white rounded-lg">
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>

        {message.text && (
          <div className={`mt-4 p-2 rounded ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white text-center`}>
            {message.text}
          </div>
        )}
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ccc;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
