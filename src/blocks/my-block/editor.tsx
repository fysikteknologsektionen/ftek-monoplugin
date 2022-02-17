import { registerBlockType } from '@wordpress/blocks';

import MyComponent from '../../components/my-component';

import metadata from './block.json';

registerBlockType(metadata, { edit: MyComponent, save: MyComponent });
