import { ArrowLeft, LogIn } from 'lucide-react';

export default function LoginPage({ role, roleDetails, isRegistering, form, error, onChange, onSubmit, onBack, onToggleMode }) {
  return (
    <main className="app-shell portal-shell">
      <section className="login-panel">
        <button className="text-button" type="button" onClick={onBack}><ArrowLeft size={16} />Back</button>
        <p className="eyebrow">{roleDetails[role].label} account</p>
        <h1>{isRegistering ? 'Create your account.' : 'Welcome back.'}</h1>
        <p className="intro">{isRegistering ? 'Register to start using attendance tools.' : 'Sign in to continue to your attendance workspace.'}</p>
        <form className="login-form" onSubmit={onSubmit} noValidate>
          {isRegistering && (
            <>
              <label htmlFor="firstName">First Name</label>
              <input id="firstName" name="firstName" type="text" placeholder="First name" value={form.firstName} onChange={onChange} />
              <label htmlFor="lastName">Last Name</label>
              <input id="lastName" name="lastName" type="text" placeholder="Last name" value={form.lastName} onChange={onChange} />
              <label htmlFor="gender">Gender</label>
              <select id="gender" name="gender" value={form.gender} onChange={onChange}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <label htmlFor="phone">Phone Number</label>
              <input id="phone" name="phone" type="tel" placeholder="Phone number" value={form.phone} onChange={onChange} />
              {role === 'student' && (
                <>
                  <label htmlFor="dob">Date of Birth</label>
                  <input id="dob" name="dob" type="date" value={form.dob} onChange={onChange} />
                  <label htmlFor="enrollmentNo">Enrollment Number</label>
                  <input id="enrollmentNo" name="enrollmentNo" type="text" placeholder="Enrollment number" value={form.enrollmentNo} onChange={onChange} />
                </>
              )}
              <label>Address</label>
              <input name="apartment" placeholder="Apartment/Flat" value={form.address?.apartment || ''} onChange={e => onChange({ target: { name: 'address.apartment', value: e.target.value } })} />
              <input name="area" placeholder="Area" value={form.address?.area || ''} onChange={e => onChange({ target: { name: 'address.area', value: e.target.value } })} />
              <input name="city" placeholder="City" value={form.address?.city || ''} onChange={e => onChange({ target: { name: 'address.city', value: e.target.value } })} />
            </>
          )}
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={onChange} aria-invalid={Boolean(error)} />
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" placeholder="At least 8 characters" value={form.password} onChange={onChange} aria-invalid={Boolean(error)} />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="continue-button" type="submit"><LogIn size={17} />{isRegistering ? 'Register' : 'Sign in'} as {roleDetails[role].label}</button>
        </form>
        <button className="text-button auth-switch" type="button" onClick={onToggleMode}>
          {isRegistering ? 'Already have an account? Sign in' : 'New here? Create an account'}
        </button>
      </section>
    </main>
  );
}
