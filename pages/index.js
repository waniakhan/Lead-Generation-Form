import { useState } from 'react';

function Home() {
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: "",
        cnic: "",
        mobile: "",
        city: "",
        product: "",
        intent: "",
    });
    const [message, setMessage] = useState({ text: "", type: "" });

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text, type: "" }), 5500); // Slightly longer duration
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        // Remove the 'email' field entirely since it's no longer in the state
        const payload = { timestamp: new Date().toISOString(), ...form };

        try {
            // Note: I'm keeping your API call structure for functionality
            const response = await fetch('https://my-form-app-beta.vercel.app/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to save lead. Please check your network.");
            showMessage("Application Successful! We will contact you shortly.", "success");
            // Clear form fields after success
            setForm({ name: "", cnic: "", mobile: "", city: "", product: "", intent: "" });
        } catch (err) {
            console.error(err);
            showMessage(`Submission Failed: ${err.message}`, "error");
        } finally {
            setSubmitting(false);
        }
    };

    // Brand Colors
    const primaryColor = '#1f4aa0'; // Deep Blue (used for inputs/header)
    const secondaryColor = '#009994'; // Teal/Cyan color used ONLY for the Submit button

    // Tailwind input class for reuse - Reduced vertical padding (p-3 -> py-2 px-3)
    const inputClass = "mt-1 block w-full rounded-xl border-gray-300 shadow-inner py-2 px-3 transition-all duration-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-300 focus:outline-none"; 
    
    // Tailwind select class for reuse (for intent/product) - Reduced vertical padding (p-3 -> py-2 px-3)
    const selectClass = "mt-1 block w-full rounded-xl border-2 shadow-lg py-2 px-3 text-gray-700 transition-all duration-300 appearance-none bg-white cursor-pointer";
    
    // Custom style for the select to show a dropdown arrow (using a lighter arrow)
    const selectStyle = {
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3e%3cpath d='M7 10l5 5 5-5H7z' fill='%239CA3AF'/%3e%3c/svg%3e")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 1rem center',
      backgroundSize: '1.2em 1.2em',
      paddingRight: '3rem', // Add padding for the arrow
    };

    // Icon components (using inline SVG for cross-platform reliability)
    const CheckCircle = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );

    const XCircle = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 9 0 01-18 0 9 9 9 0 0118 0z" />
        </svg>
    );

    return (
        <div className="font-sans antialiased text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
            <script src="https://cdn.tailwindcss.com"></script>
            
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
                {/* Reduced container padding (p-8 -> p-6) */}
                <div className="w-full max-w-lg mx-auto p-6 bg-white rounded-3xl shadow-2xl transition-all duration-500 hover:shadow-3xl">
                    
                    {/* Brand/Header Section - Reduced margin (mb-6 -> mb-4) */}
                    <div className="text-center mb-4">
                        {/* Logo reduced in size (w-64 h-24 -> w-52 h-20) */}
                        <img className="mx-auto w-35 h-20 mb-3" 
                             src="https://images.crunchbase.com/image/upload/c_pad,f_auto,q_auto:eco,dpr_1/vrjxgngilhvdzkwdxgr8" 
                             alt="Brand Logo" 
                             onError={(e) => (e.currentTarget.style.display = "none")} />
                        {/* Header text size reduced (text-4xl -> text-3xl) */}
                        <h1 className="text-3xl font-extrabold mb-1" style={{ color: primaryColor }}>
                            Quick Application Form
                        </h1>
                    </div>

                    {/* Important Note Alert - Reduced margin (mb-6 -> mb-4) */}
                    <div className="p-4 mb-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 rounded-lg shadow-inner">
                        <p className="font-semibold flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.3 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Customer Notice
                        </p>
                        <p className="text-sm mt-1 ml-7">
                            If you are already using a <strong className="font-extrabold">Noor Card</strong>, kindly <strong className="font-extrabold">exit this form</strong> to explore the best deals available in Digi Mall.
                        </p>
                    </div>

                    {/* Submission Message - Reduced margin (mb-4 -> mb-3) */}
                    {message.text && (
                        <div className={`p-3 mb-3 rounded-lg font-bold transition-opacity duration-500 flex items-center ${
                            message.type === 'success' 
                            ? 'bg-green-100 text-green-700 border border-green-300' 
                            : 'bg-red-100 text-red-700 border border-red-300'
                        }`}>
                            {message.type === 'success' ? <CheckCircle /> : <XCircle />}
                            <span>{message.text}</span>
                        </div>
                    )}

                    {/* Form - Reduced gap (gap-6 -> gap-4) */}
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
                        
                        {/* Intent Dropdown */}
                        <div className="col-span-1 md:col-span-2">
                            <label htmlFor="intent" className="text-sm font-bold text-gray-700 mb-1 block">
                                Want to avail a consumer finance product?
                            </label>
                            <select
                                id="intent"
                                name="intent"
                                value={form.intent}
                                onChange={onChange}
                                className={`${selectClass} border-gray-300 focus:ring-2 focus:ring-gray-300 focus:border-gray-400`}
                                style={selectStyle} 
                                required
                            >
                                <option value="" disabled>-- Select --</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                        
                        {/* Personal Details Header - Reduced top padding and bottom margin */}
                        <div className="col-span-1 md:col-span-2 border-t border-gray-200 pt-3">
                            <h2 className="text-xl font-bold text-gray-800 mb-3">Personal Details</h2>
                        </div>

                        {/* Name Input */}
                        <div>
                            <label htmlFor="name" className="text-sm font-semibold text-gray-700 mb-1 block">Customer Name</label>
                            <input id="name" type="text" name="name" value={form.name} onChange={onChange} placeholder="John Doe" className={inputClass} required />
                        </div>
                        
                        {/* Mobile Number Input */}
                        <div>
                            <label htmlFor="mobile" className="text-sm font-semibold text-gray-700 mb-1 block">Mobile Number</label>
                            <input id="mobile" type="tel" name="mobile" value={form.mobile} onChange={onChange} placeholder="03XXXXXXXXX" className={inputClass} required />
                        </div>
                        
                        {/* CNIC Input */}
                        <div>
                            <label htmlFor="cnic" className="text-sm font-semibold text-gray-700 mb-1 block">CNIC (13-digit)</label>
                            <input id="cnic" type="text" name="cnic" value={form.cnic} onChange={onChange} placeholder="XXXXXXXXXXXXX" className={inputClass} required />
                        </div>

                        {/* City Input */}
                        <div>
                            <label htmlFor="city" className="text-sm font-semibold text-gray-700 mb-1 block">City</label>
                            <input id="city" type="text" name="city" value={form.city} onChange={onChange} placeholder="e.g. Karachi, Lahore" className={inputClass} required />
                        </div>
                        
                        {/* Product Dropdown - Reduced top padding */}
                        {form.intent === "yes" && (
                            <div 
                                className="col-span-1 md:col-span-2 transition-all duration-500 ease-in-out border-t border-gray-200 pt-3"
                            >
                                <label htmlFor="product" className="text-sm font-bold text-gray-700 mb-1 block">
                                    Product Selection (Check Minimum Salary Requirements)
                                </label>
                                <select 
                                    id="product" 
                                    name="product" 
                                    value={form.product} 
                                    onChange={onChange} 
                                    className={`${selectClass} border-gray-300 focus:ring-2 focus:ring-gray-300 focus:border-gray-400`}
                                    style={selectStyle} 
                                    required={form.intent === "yes"}
                                >
                                    <option value="" disabled>-- Select a Product to Proceed --</option>
                                    <option value="Noor Card">💳 Noor Card (Min. Salary: PKR 40,000)</option>
                                    <option value="Installment Personal Finance">💰 Installment Personal Finance (Min. Salary: PKR 50,000)</option>
                                    <option value="Takmeel Finance">💸 Takmeel Finance (Min. Salary: PKR 50,000)</option>
                                    <option value="Auto Finance">🚗 Auto Finance (Min. Salary: PKR 100,000)</option>
                                    <option value="Home Finance">🏠 Home Finance (Min. Salary: PKR 100,000)</option>
                                </select>
                            </div>
                        )}

                        {/* Submit Button - Reduced vertical padding (py-4 -> py-3) and top margin (mt-6 -> mt-4) */}
                        <div className="col-span-1 md:col-span-2">
                            <button 
                                type="submit" 
                                disabled={submitting}
                                // Custom style for the submit button color
                                className="w-full py-3 mt-4 text-white font-extrabold rounded-xl hover:opacity-90 transition-all duration-300 transform hover:scale-[1.01] shadow-xl disabled:bg-gray-400 disabled:shadow-none focus:ring-4 focus:ring-opacity-50"
                                style={{ 
                                    backgroundColor: submitting ? '#6B7280' : secondaryColor, 
                                    '--tw-ring-color': secondaryColor // Inject ring color for focus
                                }}
                            >
                                {submitting ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing Request...
                                    </span>
                                ) : 'Submit'}
                            </button>
                        </div>
                    </form>
                    
                    <p className="text-center text-xs text-gray-400 mt-6">
                        By submitting, you consent to receive communication from us regarding your application.
                    </p>

                </div>
            </div>
        </div>
    );
}

export default Home;