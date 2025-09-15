import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class StorageService {
  private saveData(storage: Storage, key: string, data: unknown): void {
    try {
      storage.setItem(
        key,
        typeof data !== "string" ? JSON.stringify(data) : data
      );
    } catch (error) {
      console.error(
        `Error saving to ${
          storage === localStorage ? "local" : "session"
        } storage!`,
        error
      );
    }
  }

  private retrieveData<T>(
    storage: Storage,
    key: string,
    needParse: boolean
  ): T | null {
    try {
      const data = storage.getItem(key);
      return data ? (needParse ? JSON.parse(data) : (data as T)) : null;
    } catch (error) {
      console.error(
        `Error retrieving data from ${
          storage === localStorage ? "local" : "session"
        } storage!`,
        error
      );
      return null;
    }
  }

  private removeData(storage: Storage, key: string): void {
    storage.removeItem(key);
  }

  private removeAllData(storage: Storage): void {
    storage.clear();
  }

  setLocal(key: string, data: unknown): void {
    this.saveData(localStorage, key, data);
  }

  getLocal<T>(key: string, needParse: boolean = false): T | null {
    return this.retrieveData<T>(localStorage, key, needParse);
  }

  removeLocal(key: string): void {
    this.removeData(localStorage, key);
  }

  removeAllLocal(): void {
    this.removeAllData(localStorage);
  }

  setSession(key: string, data: unknown): void {
    this.saveData(sessionStorage, key, data);
  }

  getSession<T>(key: string, needParse: boolean = false): T | null {
    return this.retrieveData<T>(sessionStorage, key, needParse);
  }

  removeSession(key: string): void {
    this.removeData(sessionStorage, key);
  }

  removeAllSession(): void {
    this.removeAllData(sessionStorage);
  }
}
