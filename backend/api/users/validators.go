package users

import (
	"regexp"
	"strings"
)

var usernameRegex = regexp.MustCompile("^[a-z0-9_-]{3,24}$")

func normalizeUsername(username string) string {
	return strings.ToLower(strings.TrimSpace(username))
}

func isValidUsername(username string) bool {
	return usernameRegex.MatchString(username)
}
