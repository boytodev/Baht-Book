"use client";

import { useActionState } from "react";
import { signIn, signUp, type AuthState } from "./actions";

const initial: AuthState = {};

export function LoginForm() {
  const [signInState, signInAction, signingIn] = useActionState(signIn, initial);
  const [signUpState, signUpAction, signingUp] = useActionState(signUp, initial);
  const busy = signingIn || signingUp;
  const error = signInState.error ?? signUpState.error;
  const message = signUpState.message;

  return (
    <form className="panel" action={signInAction}>
      <h2>เข้าสู่ระบบ</h2>

      <div className="field">
        <label htmlFor="email">อีเมล</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="input"
        />
      </div>

      <div className="field">
        <label htmlFor="password">รหัสผ่าน</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={8}
          required
          className="input"
        />
      </div>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="form-ok" role="status">
          {message}
        </p>
      ) : null}

      <button type="submit" className="btn" disabled={busy}>
        เข้าสู่ระบบ
      </button>
      <button
        type="submit"
        className="btn btn-outline"
        formAction={signUpAction}
        formNoValidate={false}
        disabled={busy}
      >
        สมัครสมาชิกด้วยอีเมลนี้
      </button>
    </form>
  );
}
