package types

type AuthRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type FirebaseAuthRequest struct {
	Email             string `json:"email"`
	Password          string `json:"password"`
	ReturnSecureToken bool   `json:"returnSecureToken"`
}

type FirebaseOobRequest struct {
	RequestType string `json:"requestType"`
	IDToken     string `json:"idToken"`
	Email       string `json:"email,omitempty"`
}

type FirebaseLookupRequest struct {
	IDToken string `json:"idToken"`
}

type FirebaseLookupResponse struct {
	Users []FirebaseUser `json:"users"`
}

type FirebaseUser struct {
	LocalID       string `json:"localId"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"emailVerified"`
}

type AuthResponse struct {
	Kind         string `json:"kind"`
	IDToken      string `json:"idToken"`
	Email        string `json:"email"`
	RefreshToken string `json:"refreshToken"`
	ExpiresIn    string `json:"expiresIn"`
	LocalID      string `json:"localId"`
}

type AuthErrorResponse struct {
	Error AuthErrorDetail `json:"error"`
}

type AuthErrorDetail struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

type AuthStatusResponse struct {
	Status string `json:"status"`
	Email  string `json:"email,omitempty"`
}
