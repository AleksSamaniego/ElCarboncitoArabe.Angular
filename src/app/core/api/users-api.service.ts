import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';
import { ApiRoutes } from '../config/api-routes';
import {
  UserDto,
  CreateUserRequest,
  UpdateUserRequest,
} from '../../shared/models';

@Injectable({
  providedIn: 'root',
})
export class UsersApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: AppConfigService,
  ) {}

  getUsers(): Observable<UserDto[]> {
    const url = this.config.buildApiUrl(ApiRoutes.users);
    return this.http.get<UserDto[]>(url);
  }

  getUser(id: string): Observable<UserDto> {
    const url = this.config.buildApiUrl(`${ApiRoutes.users}/${id}`);
    return this.http.get<UserDto>(url);
  }

  createUser(req: CreateUserRequest): Observable<UserDto> {
    const url = this.config.buildApiUrl(ApiRoutes.users);
    return this.http.post<UserDto>(url, req);
  }

  updateUser(id: string, req: UpdateUserRequest): Observable<UserDto> {
    const url = this.config.buildApiUrl(`${ApiRoutes.users}/${id}`);
    return this.http.put<UserDto>(url, req);
  }

  deleteUser(id: string): Observable<void> {
    const url = this.config.buildApiUrl(`${ApiRoutes.users}/${id}`);
    return this.http.delete<void>(url);
  }
}
