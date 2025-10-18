/**
 * API Service for communicating with the backend
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { GenerateRequest, GenerateResponse, TaskStatusResponse } from '../models/task.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Create a new smart contract generation task
   */
  generateContract(prompt: string): Observable<GenerateResponse> {
    const request: GenerateRequest = { prompt };
    return this.http.post<GenerateResponse>(`${this.apiUrl}/api/generate`, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get the status of a task
   */
  getTaskStatus(taskId: string): Observable<TaskStatusResponse> {
    return this.http.get<TaskStatusResponse>(`${this.apiUrl}/api/status/${taskId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get health status of the API
   */
  getHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/health`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error?.detail) {
        errorMessage = error.error.detail;
      }
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
