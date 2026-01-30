package types

import "time"

type TemplateType string
type ID int
type Cmd string

const (
	TypeDir  TemplateType = "dir"
	TypeFile TemplateType = "file"
)

type Template struct {
	TemplateID         ID           `json:"id"`
	Username           string       `json:"username"`
	TemplateName       string       `json:"template_name"`
	Type               TemplateType `json:"type"`
	GithubRepoLink     string       `json:"github_repo_link,omitempty"`
	PreCmds            []Cmd        `json:"pre_cmds"`
	PostCmds           []Cmd        `json:"post_cmds"`
	Tags               []string     `json:"tags"`
	Code               string       `json:"code,omitempty"`
	Stars              int          `json:"stars"`
	Clones             int          `json:"clones"`
	Usage              string       `json:"usage"`
	ForkOf             ID           `json:"fork_of,omitempty"`
	ForkedBoilerplates []ID         `json:"forked_boilerplates,omitempty"`
	Description        string       `json:"description"`
	Documentation      string       `json:"documentation"`
	CreatedAt          time.Time    `json:"created_at"`
	UpdatedAt          time.Time    `json:"updated_at"`
}
