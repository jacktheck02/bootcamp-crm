import { useState } from "react";
import { login } from "../security/auth";

type Props = { onSuccess: () => void };

export function Login({ onSuccess }: Props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login(username.trim(), password);
            onSuccess();
        } catch (err: any) {
            setError(err?.message ?? "Sign-in failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-shell" role="dialog" aria-label="Sign in">
            <form onSubmit={submit} className="login-form">
                <h1>Sign in</h1>

                <div className="form-group">
                    <label htmlFor="login-username">Username</label>
                    <input
                        id="login-username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="login-password">Password</label>
                    <input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                    />
                </div>

                {error && <div role="alert" className="form-error">{error}</div>}

                <div className="login-actions">
                    <button type="submit" disabled={loading}>
                        {loading ? "Signing in…" : "Sign in"}
                    </button>
                </div>
            </form>
        </div>
    );
}