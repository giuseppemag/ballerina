### Release Process

Following https://semver.org, define a tag. Then

```sh
git tag VERSION # e.g. 1.2.3 or 1.2.3-rc1
git tag push origin VERSION
```

A new GitHub release will be created, containing the relevant artifacts.
