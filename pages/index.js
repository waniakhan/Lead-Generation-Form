import { useState } from 'react';

// The main App component which contains the form and the main page content.
function Home() {
    // State to handle the form submission state, showing "Submitting..." text.
    const [submitting, setSubmitting] = useState(false);

    // State to manage the form data.
    const [form, setForm] = useState({
        name: "",
        email: "",
        cnic: "",
        mobile: "",
        city: "",
        income: "",
        products: "",
    });

    // State for the custom message box.
    const [message, setMessage] = useState({
        text: "",
        type: "", // 'success' or 'error'
    });

    // Handler for form input changes, updating the state dynamically.
    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    // Function to show a custom message box instead of the native alert().
    const showMessage = (text, type) => {
        setMessage({ text, type });
        // Hide the message after 4 seconds.
        setTimeout(() => setMessage({ text: "", type: "" }), 4000);
    };

    // Handler for form submission.
    // Handler for form submission.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const payload = {
            timestamp: new Date().toISOString(),
            name: form.name.trim(),
            email: form.email.trim(),
            cnic: form.cnic.trim(),
            mobile: form.mobile.trim(),
            city: form.city.trim(),
            income: form.income.trim(),
            products: form.products.trim(),
        };

        try {
            // 1. Sirf lead save karo
            const response = await fetch('https://my-form-app-beta.vercel.app/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Failed to save lead.");

            showMessage("✅ Thanks! Your lead has been saved.", "success");

            // form reset
            setForm({
                name: "",
                email: "",
                cnic: "",
                mobile: "",
                city: "",
                income: "",
                products: "",
            });

        } catch (err) {
            console.error(err);
            showMessage("Something went wrong. Please try again.", "error");
        } finally {
            setSubmitting(false);
        }
    };




    // SVG for check circle icon
    const IconCheckCircle = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-8.82" /><path d="M22 4L12 14.01l-3-3" /></svg>
    );

    // SVG for alert triangle icon
    const IconAlertTriangle = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
    );

    // SVG for send icon
    const IconSend = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send-horizontal"><path d="m3 3 3 9-3 9 19-9Z" /><path d="M6 12h16" /></svg>
    );

    return (
        <div className="font-sans antialiased text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Include the Tailwind CSS CDN link directly in the component's render method */}
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />

            {/* Main page content container */}
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
                <div className="w-full max-w-xl mx-auto p-6 bg-white rounded-3xl shadow-2xl animate-scaleUp">
                    {/* Form content section */}
                    <div className="text-center mb-6">
                        {/* Using a placeholder image with onError fallback */}
                        <img
                            className="mx-auto w-40 h-auto mb-4 rounded-full"
                            src="https://images.crunchbase.com/image/upload/c_pad,f_auto,q_auto:eco,dpr_1/vrjxgngilhvdzkwdxgr8"
                            alt="Brand Logo"
                            onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                        <h1 id="lead-title" className="text-3xl font-bold text-gray-900 mb-2" style={{ color: '#1f4aa0' }}>Apply Now!</h1>
                        <p className="text-gray-500">
                            Fill this form to get a quick call-back. It only takes a minute.
                        </p>
                    </div>

                    {/* Form */}
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Name field */}
                            <div className="field">
                                <label htmlFor="name" className="text-sm font-medium text-gray-700">Complete Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-all duration-300"
                                    placeholder="e.g. Wania Khan"
                                    value={form.name}
                                    onChange={onChange}
                                    required
                                />
                            </div>

                            {/* Email field 👇 */}
                            <div>
                                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                    placeholder="e.g. waniakhan@gmail.com"
                                    value={form.email}
                                    onChange={onChange}
                                    required
                                />
                            </div>

                            {/* CNIC field */}
                            <div className="field">
                                <label htmlFor="cnic" className="text-sm font-medium text-gray-700">CNIC</label>
                                <input
                                    id="cnic"
                                    type="text"
                                    name="cnic"
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-all duration-300"
                                    placeholder="13-digit CNIC (no dashes)"
                                    inputMode="numeric"
                                    pattern="\d{13}"
                                    title="Enter 13 digits without dashes"
                                    value={form.cnic}
                                    onChange={onChange}
                                    required
                                />
                            </div>

                            {/* Mobile number field */}
                            <div className="field">
                                <label htmlFor="mobile" className="text-sm font-medium text-gray-700">Mobile Number</label>
                                <input
                                    id="mobile"
                                    type="tel"
                                    name="mobile"
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-all duration-300"
                                    placeholder="03XXXXXXXXX"
                                    pattern="^0[0-9]{10}$"
                                    title="Enter valid Pakistani mobile number (11 digits, starts with 0)"
                                    value={form.mobile}
                                    onChange={onChange}
                                    required
                                />
                            </div>

                            {/* City field */}
                            <div className="field">
                                <label htmlFor="city" className="text-sm font-medium text-gray-700">City</label>
                                <input
                                    id="city"
                                    type="text"
                                    name="city"
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-all duration-300"
                                    placeholder="e.g. Karachi"
                                    value={form.city}
                                    onChange={onChange}
                                    required
                                />
                            </div>

                            {/* Income field */}
                            <div className="field">
                                <label htmlFor="income" className="text-sm font-medium text-gray-700">Income / Salary Per Month (PKR)</label>
                                <input
                                    id="income"
                                    type="number"
                                    name="income"
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-all duration-300"
                                    placeholder="e.g. 85000"
                                    min="0"
                                    step="1000"
                                    value={form.income}
                                    onChange={onChange}
                                    required
                                />
                            </div>

                            {/* Products field (full width) */}
                            <div className="field col-span-full">
                                <label htmlFor="products" className="text-sm font-medium text-gray-700">Products Interested In</label>
                                <textarea
                                    id="products"
                                    name="products"
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-all duration-300"
                                    placeholder="Credit Card, Personal Loan, Auto Finance, etc."
                                    rows={3}
                                    value={form.products}
                                    onChange={onChange}
                                />
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-white font-bold transition-all duration-300 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:bg-opacity-70 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#0e8f97', focusRingColor: '#0e8f97', focusRingOffsetColor: '#0e8f97' }}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    {/* Inline SVG for a spinner animation */}
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.961l3-2.67z"></path>
                                    </svg>
                                    <span>Submitting...</span>
                                </>
                            ) : (
                                <>
                                    <IconSend size={18} />
                                    <span>Submit</span>
                                </>
                            )}
                        </button>

                        {/* Privacy statement */}
                        <p className="text-center text-sm text-gray-400">
                            <span role="img" aria-label="lock">🔒</span> We respect your privacy. No spam ever.
                        </p>
                    </form>
                </div>
            </div>

            {/* Custom Message Box */}
            {message.text && (
                <div
                    className={`fixed bottom-4 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-lg max-w-sm text-white font-medium flex items-center space-x-2 transition-transform duration-300 animate-slideUp
            ${message.type === "success" ? "bg-green-500" : "bg-red-500"}`}
                    role="alert"
                >
                    {message.type === "success" ? <IconCheckCircle size={20} /> : <IconAlertTriangle size={20} />}
                    <span>{message.text}</span>
                </div>
            )}
        </div>
    );
}

// Export the main component as default
export default Home;
