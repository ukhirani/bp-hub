package types

type UserDetailsRequest struct {
	IDToken            string `json:"idToken"`
	Username           string `json:"username"`
	GithubLink         string `json:"github_link"`
	ProfileDescription string `json:"profile_description"`
}

type UsernameCheckRequest struct {
	IDToken  string `json:"idToken"`
	Username string `json:"username"`
}

type UsernameCheckResponse struct {
	Available bool   `json:"available"`
	Username  string `json:"username"`
}

type UserStatusRequest struct {
	IDToken string `json:"idToken"`
}

type UserStatusResponse struct {
	HasProfile bool   `json:"hasProfile"`
	Username   string `json:"username,omitempty"`
}

type UserProfile struct {
	Username           string `json:"username" firestore:"username"`
	UID                string `json:"uid" firestore:"uid"`
	GithubLink         string `json:"github_link" firestore:"github_link"`
	ProfileDescription string `json:"profile_description" firestore:"profile_description"`
	CreatedAt          int64  `json:"created_at" firestore:"created_at"`
}
