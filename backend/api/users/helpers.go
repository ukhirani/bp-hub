package users

import (
	"context"
	"errors"

	"cloud.google.com/go/firestore"
)

var errUserNotFound = errors.New("user profile not found")

func lookupUsernameByUID(ctx context.Context, client *firestore.Client, uid string) (string, error) {
	iter := client.Collection("users").Where("uid", "==", uid).Limit(1).Documents(ctx)
	docs, err := iter.GetAll()
	if err != nil {
		return "", err
	}
	if len(docs) == 0 {
		legacy := client.Collection("users").Where("UID", "==", uid).Limit(1).Documents(ctx)
		legacyDocs, legacyErr := legacy.GetAll()
		if legacyErr != nil {
			return "", legacyErr
		}
		if len(legacyDocs) == 0 {
			return "", errUserNotFound
		}
		docs = legacyDocs
	}

	return docs[0].Ref.ID, nil
}
