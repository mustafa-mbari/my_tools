// Types
export interface DuplicateResult {
  objectId: string;
  count: number;
  className: string;
}
// XML Analysis Logic -----------------------------------------------------------------------------
  export const analyzeXMLContent = (xmlContent: string): DuplicateResult[] => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
      
      // Check for parsing errors
      const parseError = xmlDoc.getElementsByTagName('parsererror')[0];
      if (parseError) {
        throw new Error('Invalid XML format');
      }
      
      const viewObjects = xmlDoc.getElementsByTagName('ViewObject');
      const objectIdCounts = new Map<string, number>();
      const objectIdToClassname = new Map<string, string>();
      
      // Process each ViewObject
      for (let i = 0; i < viewObjects.length; i++) {
        const viewObject = viewObjects[i];
        const classname = viewObject.getAttribute('classname') || '';
        
        // Find PROPERTY element with name="ObjectId"
        const properties = viewObject.getElementsByTagName('PROPERTY');
        for (let j = 0; j < properties.length; j++) {
          const property = properties[j];
          if (property.getAttribute('name') === 'ObjectId') {
            const objectId = property.getAttribute('value') || '';
            
            if (objectId.trim() !== '') {
              objectIdCounts.set(objectId, (objectIdCounts.get(objectId) || 0) + 1);
              if (!objectIdToClassname.has(objectId)) {
                objectIdToClassname.set(objectId, classname);
              }
            }
            break;
          }
        }
      }
      
      // Apply filtering logic
      const duplicates: DuplicateResult[] = [];
      
      objectIdCounts.forEach((count, objectId) => {
        const classname = objectIdToClassname.get(objectId) || '';
        let shouldInclude = false;
        
        if (classname === 'DistanceSensor' || classname === 'ConveyorGroup') {
          // For DistanceSensor and ConveyorGroup, show only if count > 3
          if (count > 3) {
            shouldInclude = true;
          }
        } else {
          // For all other classnames, show if count > 1 (duplicated)
          if (count > 1) {
            shouldInclude = true;
          }
        }
        
        if (shouldInclude) {
          duplicates.push({
            objectId,
            count,
            className: classname
          });
        }
      });
      
      // Sort alphabetically by objectId
      return duplicates.sort((a, b) => a.objectId.localeCompare(b.objectId));
    } catch (error) {
      console.error('XML parsing error:', error);
      throw error;
    }
  };

  // Utility to copy text to clipboard
export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
    console.log(`Copied to clipboard: ${text}`);
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
};