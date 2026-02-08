package types

type TemplateCreateRequest struct {
	IDToken        string   `json:"idToken"`
	TemplateName   string   `json:"template_name"`
	Type           string   `json:"type"`
	Code           string   `json:"code"`
	FileName       string   `json:"file_name"`
	GithubRepoLink string   `json:"github_repo_link"`
	Tags           []string `json:"tags"`
}

type TemplateCreateResponse struct {
	TemplateName string `json:"template_name"`
	TemplateID   string `json:"template_id"`
	Username     string `json:"username"`
}
