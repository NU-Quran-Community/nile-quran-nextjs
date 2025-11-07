{ pkgs, lib, config, inputs, ... }:

{
  # https://devenv.sh/basics/
  env = { BASE_URL = "http://localhost:8000/"; };

  # https://devenv.sh/languages/
  languages.javascript = {
    enable = true;
    pnpm.enable = true;
  };

  scripts = { start-dev.exec = "pnpm run dev"; };

  # https://devenv.sh/processes/
  processes = {
    backend = {
      exec =
        "podman container run -it --rm -p 8000:8000 ghcr.io/nu-quran-community/nu-quran-django:latest";
    };
  };
}
