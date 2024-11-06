// ** Types **
import { ICounterData } from 'components/CounterModal/types';
import { ICourseResource } from 'modules/Courses/types';

export const getEmptyResource = (): ICourseResource[] =>
  [{ resource_id: '', quantity: '' }] as unknown as ICourseResource[];

export const getRemainingResources = (
  resources: ICounterData[],
  selectedResources: ICourseResource[]
): ICounterData[] => {
  return resources
    .map((item) => {
      const selectedQuantity =
        (selectedResources ?? []).find(
          (selected) => selected.resource_id === item.id
        )?.quantity ?? 0;
      return {
        ...item,
        quantity: Math.max(0, item.quantity - selectedQuantity),
      };
    })
    .filter((r) => r.quantity > 0);
};

export const checkResourcesAvailability = (
  resourcesList: ICounterData[],
  main_resources: ICourseResource[],
  optional_resources: ICourseResource[]
): { [key: string]: boolean } => {
  const isResourcesAvailable = (resources: ICourseResource[]): boolean => {
    return resources
      .filter((r) => r.resource_id)
      .every((resource) => {
        const matchedResource = resourcesList.find(
          (r) => r.id === resource.resource_id
        );
        if (!matchedResource) return false; // Resource not found in resourcesList
        return resource.quantity <= matchedResource.quantity; // Check if quantity is within limits
      });
  };

  const isMainResourcesAvailable = isResourcesAvailable(main_resources ?? []);
  const isOptionalResourcesAvailable = isResourcesAvailable(
    optional_resources ?? []
  );

  const isSumOfQuantitiesValid = (): boolean => {
    if (resourcesList?.length <= 0) return false;
    const combinedResources = [
      ...(main_resources ?? []),
      ...(optional_resources ?? []),
    ];
    const sumOfQuantities = combinedResources?.reduce((sum, resource) => {
      const matchedResource = resourcesList.find(
        (r) => r.id === resource.resource_id
      );
      return (
        sum +
        (matchedResource ? Math.min(resource.quantity, matchedResource.quantity) : 0)
      );
    }, 0);
    return (
      sumOfQuantities <=
      resourcesList.reduce((sum, resource) => sum + resource.quantity, 0)
    );
  };
  return {
    isMainResourcesAvailable,
    isOptionalResourcesAvailable,
    combinedResourcesAvailable: isSumOfQuantitiesValid(),
  };
};
