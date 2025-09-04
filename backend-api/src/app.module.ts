


import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectController } from './project/project.controller';
import { ProjectService } from './project/project.service';
import { TestGeneratorModule } from './test-generator/test-generator.module';
import { Project } from './project/project.entity';
import { PageController } from './page/page.controller';
import { PageService } from './page/page.service';
import { Page } from './page/page.entity';
import { TestController } from './test/test.controller';
import { TestService } from './test/test.service';
import { Test } from './test/test.entity';
import { LogController } from './log/log.controller';
import { LogService } from './log/log.service';
import { Log } from './log/log.entity';
import { SettingController } from './setting/setting.controller';
import { SettingService } from './setting/setting.service';
import { Setting } from './setting/setting.entity';
import { ApiEndpointController } from './api-endpoint/api-endpoint.controller';
import { ApiEndpointService } from './api-endpoint/api-endpoint.service';
import { ApiEndpoint } from './api-endpoint/api-endpoint.entity';
import { ApiCollectionController } from './api-collection/api-collection.controller';
import { ApiCollectionService } from './api-collection/api-collection.service';
import { ApiCollection } from './api-collection/api-collection.entity';
import { AiModelController } from './ai-model/ai-model.controller';
import { AiModelService } from './ai-model/ai-model.service';
import { AiModel } from './ai-model/ai-model.entity';
import { SavedTestController } from './saved-test/saved-test.controller';
import { SavedTestService } from './saved-test/saved-test.service';
import { SavedTest } from './saved-test/saved-test.entity';
import { ScannerController } from './scanner/scanner.controller';
import { ScannerService } from './scanner/scanner.service';
import { TestGeneratorController } from './test-generator/test-generator.controller';
import { TestGeneratorService } from './test-generator/test-generator.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'tes',
      password: '1qaz@WSX',
      database: 'testp',
      entities: [
        Project,
        Page,
        Test,
        Log,
        Setting,
        ApiEndpoint,
  ApiCollection,
        AiModel,
      ],
      synchronize: false,
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([
      Project,
      Page,
      Test,
      Log,
      Setting,
      ApiEndpoint,
  ApiCollection,
  AiModel,
  SavedTest,
    ]),
    // Import the TestGeneratorModule so its providers (e.g., ScannerAdapterService)
    // are available and TestGeneratorService can be resolved properly
    TestGeneratorModule,
  ],
  controllers: [
    AppController,
    ProjectController,
    PageController,
    TestController,
    LogController,
    SettingController,
    ApiEndpointController,
    AiModelController,
  SavedTestController,
  // api collections
  ApiCollectionController,
    ScannerController,
  ],
  providers: [
    AppService,
    ProjectService,
    PageService,
    TestService,
    LogService,
    SettingService,
    ApiEndpointService,
    AiModelService,
  SavedTestService,
  ApiCollectionService,
    ScannerService,
  ],
})
export class AppModule {}
