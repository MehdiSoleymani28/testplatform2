import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiCollection } from './api-collection.entity';
import { CreateApiCollectionDto } from './dto/create-api-collection.dto';
import { UpdateApiCollectionDto } from './dto/update-api-collection.dto';
import { Project } from '../project/project.entity';
import { ApiEndpoint } from '../api-endpoint/api-endpoint.entity';

@Injectable()
export class ApiCollectionService {
  constructor(
    @InjectRepository(ApiCollection)
    private readonly apiCollectionRepository: Repository<ApiCollection>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ApiEndpoint)
    private readonly apiEndpointRepository: Repository<ApiEndpoint>,
  ) {}

  findAll(projectId?: number) {
    const where = projectId ? { where: { project: { id: projectId } }, relations: ['endpoints', 'project'] } : { relations: ['endpoints', 'project'] } as any;
    return this.apiCollectionRepository.find(where);
  }

  findOne(id: number) {
    return this.apiCollectionRepository.findOne({ where: { id }, relations: ['endpoints', 'project'] });
  }

  async create(dto: CreateApiCollectionDto) {
    let project: Project | null = null;
    if (dto.projectId) {
      project = await this.projectRepository.findOne({ where: { id: dto.projectId } });
    }

    const collection = this.apiCollectionRepository.create({
      name: dto.name,
      description: dto.description,
      project: project ?? undefined,
    } as any);

    if (dto.endpoints && dto.endpoints.length) {
      const eps = await this.apiEndpointRepository.findByIds(dto.endpoints as any);
      (collection as any).endpoints = eps as any;
    }

    return this.apiCollectionRepository.save(collection) as unknown as ApiCollection;
  }

  async update(id: number, dto: UpdateApiCollectionDto) {
  const c = await this.apiCollectionRepository.findOne({ where: { id }, relations: ['endpoints', 'project'] });
    if (!c) return null;
    if (dto.name !== undefined) c.name = dto.name;
    if (dto.description !== undefined) c.description = dto.description;
    if (dto.projectId !== undefined) {
      const p = await this.projectRepository.findOne({ where: { id: dto.projectId } });
      if (p) c.project = p as any;
    }
    if (dto.endpoints) {
      const eps = await this.apiEndpointRepository.findByIds(dto.endpoints as any || []);
      (c as any).endpoints = eps as any;
    }
    return this.apiCollectionRepository.save(c) as unknown as ApiCollection;
  }

  async remove(id: number) {
    const c = await this.apiCollectionRepository.findOne({ where: { id } });
    if (!c) return null;
    await this.apiCollectionRepository.remove(c);
    return true;
  }

  async addEndpointsToCollection(collectionId: number, endpointIds: number[]) {
    const c = await this.apiCollectionRepository.findOne({ where: { id: collectionId }, relations: ['endpoints'] });
    if (!c) return null;
    const eps = await this.apiEndpointRepository.findByIds(endpointIds);
    c.endpoints = Array.from(new Set([...(c.endpoints || []), ...(eps as any)])) as any;
    return this.apiCollectionRepository.save(c) as unknown as ApiCollection;
  }

  async removeEndpointsFromCollection(collectionId: number, endpointIds: number[]) {
    const c = await this.apiCollectionRepository.findOne({ where: { id: collectionId }, relations: ['endpoints'] });
    if (!c) return null;
    if (!c.endpoints || !c.endpoints.length) return c as any;
    c.endpoints = (c.endpoints || []).filter(e => !endpointIds.includes((e as any).id));
    return this.apiCollectionRepository.save(c) as unknown as ApiCollection;
  }

  async runCollection(collectionId: number, onlySavedTests = false) {
    const c = await this.apiCollectionRepository.findOne({ where: { id: collectionId }, relations: ['endpoints', 'project'] });
    if (!c) return null;

    // Simple run implementation: for each endpoint perform an HTTP request and collect status.
    // If onlySavedTests is true, we would look up saved tests and execute them; for now run basic HTTP checks.
    const fetch = require('node-fetch');
    const results: Array<any> = [];
    for (const ep of c.endpoints || []) {
      const start = Date.now();
      try {
        const res = await fetch((ep as any).url, { method: (ep as any).method });
        const duration = Date.now() - start;
        results.push({ endpointId: (ep as any).id, status: res.ok ? 'passed' : 'failed', httpStatus: res.status, durationMs: duration });
      } catch (err: any) {
        const duration = Date.now() - start;
        results.push({ endpointId: (ep as any).id, status: 'failed', httpStatus: null, durationMs: duration, output: String(err) });
      }
    }

    const summary = { total: results.length, passed: results.filter(r => r.status === 'passed').length, failed: results.filter(r => r.status === 'failed').length };
    return { collectionId, summary, results };
  }

  // Import OpenAPI/Swagger JSON and create ApiCollection records for each tag.
  async importOpenApi(payload: any) {
    let doc = payload?.document;
    if (!doc && payload?.raw) {
      try {
        doc = JSON.parse(payload.raw);
      } catch (err) {
        doc = null;
      }
    }
    if (!doc && (payload?.openapi || payload?.swagger)) {
      doc = payload;
    }
    if (!doc) return { created: 0, collections: [] };

    // OpenAPI v3: tags array, paths object
    const tags = doc.tags || [];
    const paths = doc.paths || {};
    const created: any[] = [];

    // Helper: normalize method to uppercase
    const normMethod = (m: string) => (m || '').toUpperCase();

    for (const tag of tags) {
      const name = tag.name || tag.title || 'default';
      const description = tag.description || '';

      // create collection
      const c = this.apiCollectionRepository.create({ name, description } as any);
      // find endpoints that reference this tag
      const matched: any[] = [];
      for (const p of Object.keys(paths)) {
        const methods = paths[p] || {};
        for (const m of Object.keys(methods)) {
          const op = methods[m] || {};
          const opTags = op.tags || [];
          if (opTags.includes(tag.name)) {
            // try to find endpoint by path+method
            const methodUpper = normMethod(m);
            const ep = await this.apiEndpointRepository.findOne({ where: { url: p, method: methodUpper } });
            if (ep) matched.push(ep as any);
          }
        }
      }

      if (matched.length) (c as any).endpoints = matched as any;
      const saved = await this.apiCollectionRepository.save(c) as unknown as ApiCollection;
      created.push({ name: saved.name, id: (saved as any).id, endpoints: (saved as any).endpoints || [] });
    }

    return { created: created.length, collections: created };
  }
}
