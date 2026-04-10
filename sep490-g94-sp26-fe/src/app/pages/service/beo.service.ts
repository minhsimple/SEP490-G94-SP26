import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE = 'http://localhost:8080/api/v1';

export type TaskState = 'NOT_COMPLETED' | 'COMPLETED';

export interface TaskListTask {
	id: number;
	title: string;
	description?: string;
	state: TaskState | string;
	priority?: number;
	taskCategoryId?: number;
}

export interface TaskCategoryGroup {
	categoryId?: number;
	categoryTitle?: string;
	tasks: TaskListTask[];
}

export interface TaskList {
	id: number;
	contractId?: number;
	name?: string;
	description?: string;
	contractNo?: string;
	hallName?: string;
	bookingTime?: string;
	status?: string;
	taskCategoryGroups: TaskCategoryGroup[];
}

export interface TaskListSearchFilter {
	contractId?: number;
	contractNo?: string;
	name?: string;
	bookingTime?: string;
	coordinatorId?: number;
	status?: string;
}

export interface TaskListUpdateTaskPayload {
	title: string;
	description?: string;
	priority?: number;
	state: TaskState | string;
}

export interface TaskListUpdateCategoryPayload {
	title: string;
	tasks: TaskListUpdateTaskPayload[];
}

export interface TaskListUpdatePayload {
	taskCategoryGroups: TaskListUpdateCategoryPayload[];
}

export interface ApiResponse<T> {
	code: number;
	message: string;
	data: T;
}

@Injectable({ providedIn: 'root' })
export class TaskListService {
	constructor(private http: HttpClient) {}

	private getHeaders(): HttpHeaders {
		const token = localStorage.getItem('accessToken') ?? '';
		return new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		});
	}

	searchTaskLists(filter: TaskListSearchFilter = {}): Observable<ApiResponse<TaskList[]>> {
		let params = new HttpParams();

		if (filter.contractId) params = params.set('contractId', filter.contractId);
		if (filter.contractNo) params = params.set('contractNo', filter.contractNo);
		if (filter.name) params = params.set('name', filter.name);
		if (filter.bookingTime) params = params.set('bookingTime', filter.bookingTime);
		if (filter.coordinatorId) params = params.set('coordinatorId', filter.coordinatorId);
		if (filter.status) params = params.set('status', filter.status);

		return this.http.get<ApiResponse<TaskList[]>>(`${BASE}/task-list/search`, {
			headers: this.getHeaders(),
			params,
		});
	}

	getTaskListById(taskListId: number): Observable<ApiResponse<TaskList>> {
		return this.http.get<ApiResponse<TaskList>>(`${BASE}/task-list/${taskListId}`, {
			headers: this.getHeaders(),
		});
	}

	updateTaskList(taskListId: number, payload: TaskListUpdatePayload): Observable<ApiResponse<TaskList>> {
		const params = new HttpParams().set('taskListId', taskListId);
		return this.http.put<ApiResponse<TaskList>>(`${BASE}/task-list/update`, payload, {
			headers: this.getHeaders(),
			params,
		});
	}

	changeTaskListStatus(taskListId: number): Observable<ApiResponse<TaskList>> {
		return this.http.put<ApiResponse<TaskList>>(`${BASE}/task-list/${taskListId}/change-status`, {}, {
			headers: this.getHeaders(),
		});
	}
}
