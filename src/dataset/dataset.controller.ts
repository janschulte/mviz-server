import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';

import { OptionalParseIntPipe } from '../pipes/optional-parse-int.pipe';
import { DatasetProvider } from '../provider/dataset-provider';
import { Dataset, Datasets, DistributionType } from '../shared/dataset';

@Controller('dataset')
export class DatasetController {

  constructor(
    private readonly datasetProvider: DatasetProvider,
  ) { }

  @Get()
  getDatasets(
    @Query('searchTerm') searchTerm: string,
    @Query('distributionType') distributionTypes: string,
    @Query('limit', OptionalParseIntPipe) limit: number = 10,
    @Query('offset', OptionalParseIntPipe) offset: number = 0,
  ): Datasets {
    const distTypes = (distributionTypes ? distributionTypes.split(',') : []) as DistributionType[];
    return this.datasetProvider.getDatasets(searchTerm, distTypes, limit, offset);
  }

  @Get(':id')
  getDataset(@Param('id') id): Dataset {
    const dataset = this.datasetProvider.getDataset(id);
    if (dataset) {
      return dataset;
    } else {
      throw new NotFoundException();
    }
  }
}
