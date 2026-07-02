import { useMutation } from "@tanstack/react-query";
import * as authApi from "./api";

export function useLogin() {
  return useMutation({ mutationFn: authApi.login });
}

export function useRegister() {
  return useMutation({ mutationFn: authApi.register });
}

export function useLogout() {
  return useMutation({ mutationFn: authApi.logout });
}
